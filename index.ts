// supabase/functions/validar-pedido/index.ts
// Edge Function — White Label
//
// Responsabilidade:
//   1. Recebe o payload do pedido vindo do app
//   2. Se for delivery com coordenadas, recalcula o frete no servidor
//      usando OSRM (fallback: Haversine) + tabela_frete do banco
//   3. Verifica limite_distancia_km — rejeita se ultrapassado
//   4. Corrige silenciosamente se o cliente enviou frete menor que o real
//   5. Insere o pedido com os valores corretos e retorna { id }
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

// ── Handler ───────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const payload = await req.json();

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Carrega configurações: coordenadas, tabela de frete e limite ──────
    const { data: cfg } = await supa
      .from("configuracoes")
      .select("tabela_frete, coord_lat, coord_lng, limite_distancia_km")
      .single();

    const tabelaFrete    = cfg?.tabela_frete       ?? null;
    const limiteDistKm   = cfg?.limite_distancia_km ?? null;
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

    // ── Monta pedido ──────────────────────────────────────────────────────
    const pedido = {
      ...payload,
      frete_cobrado_cliente: freteFinal,
      frete_motoboy:         freteMotoboy,
      frete_a_combinar:      freteACombinar,
      total_geral:
        (payload.subtotal ?? 0) -
        (payload.desconto_cupom ?? 0) +
        (payload.tipo_entrega === "delivery" ? freteFinal : 0),
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

const MSGS: Record<string, { title: string; body: string }> = {
  pendente:       { title: "🛒 Pedido Recebido",         body: "Aguardando confirmação da loja..." },
  em_preparo:     { title: "🔥 Pedido Confirmado!",      body: "Sua comida está sendo preparada!" },
  pronto_entrega: { title: "📦 Pedido Pronto!",          body: "Aguardando o motoboy para entrega." },
  saiu_entrega:   { title: "🛵 Saiu para Entrega!",      body: "Seu pedido está a caminho. Logo chega!" },
  entregue:       { title: "✅ Pedido Entregue!",        body: "Bom apetite! Obrigado pela preferência 🎉" },
  cancelado:      { title: "❌ Pedido Cancelado",        body: "Entre em contato conosco pelo WhatsApp." },
};
 
// ── VAPID: geração do JWT de autorização ─────────────────────────────────────
// Implementação manual usando Web Crypto (disponível nativamente no Deno).
// Não requer npm:web-push, funciona em qualquer Edge Runtime.
 
function base64urlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
 
function base64urlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from([...binary].map((c) => c.charCodeAt(0)));
}
 
async function gerarVapidJwt(
  audience: string,      // "https://fcm.googleapis.com" ou endpoint origin
  subject: string,       // "mailto:..."
  privateKeyB64: string  // chave privada VAPID base64url (32 bytes)
): Promise<string> {
  const header  = base64urlEncode(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const iat     = Math.floor(Date.now() / 1000);
  const payload = base64urlEncode(new TextEncoder().encode(JSON.stringify({ aud: audience, exp: iat + 43200, sub: subject })));
 
  const keyBytes = base64urlDecode(privateKeyB64);
 
  // Importa como chave EC P-256 "raw" — precisa ser JWK
  const jwk = {
    kty: "EC", crv: "P-256", d: privateKeyB64,
    x: "", y: "",            // preenchido abaixo via exportação temporária
  };
 
  // Importa como pkcs8 (sec1 DER raw 32 bytes precisa ser embrulhado)
  // Alternativa direta via JWK importando só 'd' — funciona no Deno
  const rawPrivate = keyBytes; // 32 bytes
 
  // Constrói PKCS#8 DER manualmente (EC P-256 private key wrapper)
  // RFC 5958 / SEC 1: 30 81 87 02 01 00 30 13 06 07 2a 86 48 ce 3d 02 01 06 08 2a 86 48 ce 3d 03 01 07 04 6d 30 6b 02 01 01 04 20 [32 bytes key]
  const pkcs8Header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07,
    0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08,
    0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04,
    0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8 = new Uint8Array(pkcs8Header.length + rawPrivate.length);
  pkcs8.set(pkcs8Header);
  pkcs8.set(rawPrivate, pkcs8Header.length);
 
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", pkcs8.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
 
  const sigInput  = new TextEncoder().encode(`${header}.${payload}`);
  const sigBuffer = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cryptoKey, sigInput);
  const signature = base64urlEncode(sigBuffer);
 
  return `${header}.${payload}.${signature}`;
}
 
// ── Envia Web Push ────────────────────────────────────────────────────────────
async function enviarWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidEmail: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url    = new URL(subscription.endpoint);
  const origin = `${url.protocol}//${url.host}`;
 
  // Gera JWT VAPID
  let jwt: string;
  try {
    jwt = await gerarVapidJwt(origin, vapidEmail, vapidPrivateKey);
  } catch (e) {
    return { ok: false, error: `JWT error: ${(e as Error).message}` };
  }
 
  // Criptografa payload usando Web Crypto (ECDH + AES-GCM — RFC 8291)
  // Para simplicidade e compatibilidade máxima, enviamos o payload sem criptografia
  // usando Content-Encoding: aes128gcm com payload vazio e dependemos do service worker.
  // A spec permite payload vazio (notification-only push).
  // Se precisar de payload seguro, use npm:web-push no lugar desta implementação.
  const headers: Record<string, string> = {
    "Authorization": `vapid t=${jwt},k=${vapidPublicKey}`,
    "TTL": "86400",
    "Urgency": "high",
  };
 
  let body: BodyInit | undefined;
 
  if (payload) {
    // Encriptação simplificada: envia como texto plano para Content-Encoding aesgcm
    // O service worker vai receber o push mas o payload chega vazio — OK para notificações
    // com dados embutidos no side-channel (ex: tag fixa no SW).
    // Para payload criptografado completo, use a Edge Function com npm:web-push.
    headers["Content-Type"] = "application/json";
    body = payload;
  }
 
  try {
    const res = await fetch(subscription.endpoint, { method: "POST", headers, body });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
 
// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
 
  try {
    const { pedido_id, status } = await req.json();
 
    if (!pedido_id || !status) {
      return new Response(JSON.stringify({ error: "pedido_id e status são obrigatórios" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }
 
    const msg = MSGS[status];
    if (!msg) {
      return new Response(JSON.stringify({ ok: true, skipped: "status sem mensagem configurada" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
    }
 
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
 
    // Busca subscription salva no pedido
    const { data: pedido, error } = await supa
      .from("pedidos")
      .select("push_subscription, cliente_nome, id")
      .eq("id", pedido_id)
      .single();
 
    if (error || !pedido?.push_subscription) {
      console.log(`[notificar-cliente] Pedido ${pedido_id}: sem push_subscription — pulando.`);
      return new Response(JSON.stringify({ ok: true, skipped: "sem subscription" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
    }
 
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidPublic  = Deno.env.get("VAPID_PUBLIC_KEY")  ?? "";
    const vapidEmail   = Deno.env.get("VAPID_EMAIL")       ?? "mailto:admin@restaurante.com";
 
    if (!vapidPrivate || !vapidPublic) {
      console.error("[notificar-cliente] VAPID keys não configuradas nas env vars.");
      return new Response(JSON.stringify({ error: "VAPID não configurado" }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
    }
 
    const payload = JSON.stringify({
      title: msg.title,
      body:  msg.body,
      tag:   `pedido-${pedido_id}`,
      url:   "/",
    });
 
    const result = await enviarWebPush(
      pedido.push_subscription as { endpoint: string; keys: { p256dh: string; auth: string } },
      payload,
      vapidPrivate,
      vapidPublic,
      vapidEmail
    );
 
    if (!result.ok) {
      // HTTP 410 Gone = subscription expirou → limpa do banco
      if (result.status === 410) {
        await supa.from("pedidos").update({ push_subscription: null }).eq("id", pedido_id);
        console.log(`[notificar-cliente] Subscription expirada para pedido ${pedido_id} — removida.`);
      } else {
        console.error(`[notificar-cliente] Falha ao enviar push (${result.status}):`, result.error);
      }
    } else {
      console.log(`[notificar-cliente] Push enviado para pedido ${pedido_id} status=${status}`);
    }
 
    return new Response(JSON.stringify({ ok: result.ok, status: result.status }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
 
  } catch (err) {
    console.error("[notificar-cliente] Erro inesperado:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});

