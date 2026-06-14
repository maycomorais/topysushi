// supabase/functions/validar-pedido/index.ts
// Edge Function — White Label
//
// Responsabilidade:
//   1. Recebe o payload do pedido vindo do app
//   2. Verifica se a loja está aberta (loja_aberta) — rejeita se fechada
//   3. Se for delivery com coordenadas, recalcula o frete no servidor
//      usando OSRM (fallback: Haversine) + tabela_frete do banco
//   4. Verifica limite_distancia_km — rejeita se ultrapassado
//   5. Corrige silenciosamente se o cliente enviou frete menor que o real
//   6. Aplica descontos corretamente no total_geral (cupom + pdv + cashback)
//   7. Insere o pedido com os valores corretos e retorna { id }
//
// Deploy:
//   supabase functions deploy validar-pedido --project-ref <REF>

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Faixas de km (espelha app.js) ────────────────────────────────────────
const LIMITES_KM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// ── CORS ──────────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Haversine ─────────────────────────────────────────────────────────────
function distanciaReta(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── OSRM ──────────────────────────────────────────────────────────────────
async function distanciaPelaRota(
  lat1: number, lon1: number, lat2: number, lon2: number
): Promise<number | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const d = await r.json();
    if (d.code === "Ok") return d.routes[0].distance / 1000;
    return null;
  } catch {
    return null;
  }
}

// ── Calcula frete esperado ────────────────────────────────────────────────
function calcularFreteEsperado(
  dist: number,
  tabelaFrete: Array<{ loja: number; motoboy: number; acombinar?: boolean }> | null
): { loja: number; motoboy: number; acombinar: boolean } {
  let freteIndex = -1;
  for (let i = 0; i < LIMITES_KM.length; i++) {
    if (dist <= LIMITES_KM[i]) { freteIndex = i; break; }
  }

  if (freteIndex === -1) return { loja: 0, motoboy: 0, acombinar: true };
  if (tabelaFrete?.[freteIndex]?.acombinar) return { loja: 0, motoboy: 0, acombinar: true };

  if (tabelaFrete?.[freteIndex]) {
    return {
      loja:    tabelaFrete[freteIndex].loja    || 0,
      motoboy: tabelaFrete[freteIndex].motoboy || 0,
      acombinar: false,
    };
  }

  // Fallback sem tabela
  let loja = 0;
  if      (dist <= 3) loja = 6000;
  else if (dist <= 5) loja = 12000;
  else if (dist <= 8) loja = 18000;
  else                loja = 24000 + Math.ceil(dist - 8) * 3000;
  return { loja, motoboy: loja, acombinar: false };
}

// ── Verifica se loja está aberta pelos horários semanais ──────────────────
function lojaEstaAberta(
  lojaAberta: boolean,
  horarios: Record<string, { aberto: boolean; inicio: string; fim: string }> | null
): boolean {
  // Se admin desativou manualmente, respeita
  if (!lojaAberta) return false;

  // Se não há grade horária configurada, usa apenas a flag manual
  if (!horarios) return true;

  // Assunção: UTC-3 permanente (aboliu horário de verão em 2024)
  const agora   = new Date();
  const agoraParaguai = new Date(agora.getTime() - 3 * 3600 * 1000);
  const dias    = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const diaKey  = dias[agoraParaguai.getUTCDay()];
  const config  = horarios[diaKey];

  if (!config || !config.aberto) return false;

  const [hIni, mIni] = config.inicio.split(":").map(Number);
  const [hFim, mFim] = config.fim.split(":").map(Number);
  const minAtual = agoraParaguai.getUTCHours() * 60 + agoraParaguai.getUTCMinutes();
  const minIni   = hIni * 60 + mIni;
  const minFim   = hFim * 60 + mFim;

  // Suporte a virada de meia-noite (ex: 20:00–02:00)
  if (minFim < minIni) {
    return minAtual >= minIni || minAtual < minFim;
  }
  return minAtual >= minIni && minAtual < minFim;
}

// ── Handler ───────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const payload = await req.json();

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Carrega configurações ─────────────────────────────────────────────
    const { data: cfg } = await supa
      .from("configuracoes")
      .select("tabela_frete, coord_lat, coord_lng, limite_distancia_km, loja_aberta, horarios_semanais")
      .single();

    // ── Verifica se a loja está aberta ────────────────────────────────────
    // Pedidos do tipo "balcao" feitos pelo PDV físico ignoram o horário —
    // a loja física pode estar atendendo mesmo fora do horário de delivery.
    const isAppDelivery = payload.tipo_entrega !== "balcao";
    if (isAppDelivery) {
      const aberta = lojaEstaAberta(
        cfg?.loja_aberta ?? true,
        cfg?.horarios_semanais ?? null
      );
      if (!aberta) {
        return new Response(
          JSON.stringify({ error: "Loja fechada. Aguarde o horário de atendimento." }),
          { status: 422, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
    }

    const tabelaFrete  = cfg?.tabela_frete       ?? null;
    const limiteDistKm = cfg?.limite_distancia_km ?? null;
    const coordLoja = {
      lat: parseFloat(cfg?.coord_lat ?? "0") || 0,
      lng: parseFloat(cfg?.coord_lng ?? "0") || 0,
    };

    // ── Validação de frete ────────────────────────────────────────────────
    let freteFinal     = payload.frete_cobrado_cliente ?? 0;
    let freteMotoboy   = payload.frete_motoboy         ?? 0;
    let freteACombinar = false;

    if (payload.tipo_entrega === "delivery" && payload.geo_lat && payload.geo_lng) {
      const lat = parseFloat(payload.geo_lat);
      const lng = parseFloat(payload.geo_lng);

      let dist = await distanciaPelaRota(coordLoja.lat, coordLoja.lng, lat, lng);
      if (dist === null) dist = distanciaReta(coordLoja.lat, coordLoja.lng, lat, lng);

      // Rejeita se além do limite configurado
      if (limiteDistKm && dist > limiteDistKm) {
        return new Response(
          JSON.stringify({ error: `Distância (${dist.toFixed(1)}km) excede o limite de entrega (${limiteDistKm}km).` }),
          { status: 422, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      const esperado = calcularFreteEsperado(dist, tabelaFrete);

      if (esperado.acombinar) {
        freteFinal     = 0;
        freteMotoboy   = 0;
        freteACombinar = true;
      } else if (payload.frete_cobrado_cliente < esperado.loja) {
        console.warn(`[validar-pedido] Frete corrigido: enviado=${payload.frete_cobrado_cliente} esperado=${esperado.loja} dist=${dist.toFixed(2)}km`);
        freteFinal   = esperado.loja;
        freteMotoboy = esperado.motoboy;
      }
    }

    // ── Monta total_geral com TODOS os descontos ──────────────────────────
    // CORREÇÃO: versão anterior ignorava desconto_pdv_valor e cashback_valor,
    // gravando total incorreto no banco.
    const subtotal          = payload.subtotal          ?? 0;
    const descontoCupom     = payload.desconto_cupom    ?? 0;
    const descontoPdv       = payload.desconto_pdv_valor ?? 0;
    const descontoCashback  = payload.cashback_valor    ?? 0;
    const freteParaTotal    = payload.tipo_entrega === "delivery" ? freteFinal : 0;

    const totalGeral = Math.max(
      0,
      subtotal - descontoCupom - descontoPdv - descontoCashback + freteParaTotal
    );

    // ── Monta pedido ──────────────────────────────────────────────────────
    const pedido = {
      ...payload,
      frete_cobrado_cliente: freteFinal,
      frete_motoboy:         freteMotoboy,
      frete_a_combinar:      freteACombinar,
      total_geral:           totalGeral,
    };

    const { data: salvo, error } = await supa
      .from("pedidos")
      .insert([pedido])
      .select()
      .single();

    if (error) {
      console.error("[validar-pedido] Erro:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ id: salvo.id, frete_cobrado_cliente: freteFinal, frete_a_combinar: freteACombinar }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[validar-pedido] Erro inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
