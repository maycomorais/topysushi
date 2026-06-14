// supabase/functions/notificar-cliente/index.ts
// Edge Function — Envia Web Push VAPID ao cliente quando o status do pedido muda
//
// Deploy:
//   supabase functions deploy notificar-cliente --project-ref <REF>
//
// Env vars necessárias (Supabase Dashboard → Settings → Edge Functions → Secrets):
//   VAPID_PRIVATE_KEY  — chave privada EC P-256 base64url (32 bytes)
//   VAPID_PUBLIC_KEY   — chave pública VAPID base64url
//   VAPID_EMAIL        — ex: "mailto:admin@minhaloja.com"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Mensagens por status ──────────────────────────────────────────────────
const MSGS: Record<string, { title: string; body: string }> = {
  pendente:       { title: "🛒 Pedido Recebido",        body: "Aguardando confirmação da loja..." },
  em_preparo:     { title: "🔥 Pedido Confirmado!",     body: "Seu pedido está sendo preparado!" },
  pronto_entrega: { title: "📦 Pedido Pronto!",         body: "Aguardando o motoboy para entrega." },
  saiu_entrega:   { title: "🛵 Saiu para Entrega!",     body: "Seu pedido está a caminho. Logo chega!" },
  entregue:       { title: "✅ Pedido Entregue!",       body: "Obrigado pela preferência 🎉" },
  cancelado:      { title: "❌ Pedido Cancelado",       body: "Entre em contato conosco pelo WhatsApp." },
};

// ── CORS ──────────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── VAPID helpers ─────────────────────────────────────────────────────────
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
  audience: string,
  subject: string,
  privateKeyB64: string
): Promise<string> {
  const header  = base64urlEncode(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const iat     = Math.floor(Date.now() / 1000);
  const payload = base64urlEncode(new TextEncoder().encode(JSON.stringify({ aud: audience, exp: iat + 43200, sub: subject })));

  const keyBytes = base64urlDecode(privateKeyB64);

  // Constrói PKCS#8 DER para chave EC P-256 raw (32 bytes)
  const pkcs8Header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07,
    0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08,
    0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04,
    0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8 = new Uint8Array(pkcs8Header.length + keyBytes.length);
  pkcs8.set(pkcs8Header);
  pkcs8.set(keyBytes, pkcs8Header.length);

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

// ── Envia Web Push ────────────────────────────────────────────────────────
async function enviarWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidEmail: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url    = new URL(subscription.endpoint);
  const origin = `${url.protocol}//${url.host}`;

  let jwt: string;
  try {
    jwt = await gerarVapidJwt(origin, vapidEmail, vapidPrivateKey);
  } catch (e) {
    return { ok: false, error: `JWT error: ${(e as Error).message}` };
  }

  const headers: Record<string, string> = {
    "Authorization": `vapid t=${jwt},k=${vapidPublicKey}`,
    "TTL":           "86400",
    "Urgency":       "high",
  };

  let body: BodyInit | undefined;
  if (payload) {
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

// ── Handler principal ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { pedido_id, status } = await req.json();

    if (!pedido_id || !status) {
      return new Response(
        JSON.stringify({ error: "pedido_id e status são obrigatórios" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const msg = MSGS[status];
    if (!msg) {
      return new Response(
        JSON.stringify({ ok: true, skipped: "status sem mensagem configurada" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Busca subscription e nome da loja no mesmo request
    const [{ data: pedido, error }, { data: cfgLoja }] = await Promise.all([
      supa.from("pedidos")
          .select("push_subscription, cliente_nome, id")
          .eq("id", pedido_id)
          .single(),
      supa.from("configuracoes")
          .select("nome_restaurante")
          .single(),
    ]);

    if (error || !pedido?.push_subscription) {
      console.log(`[notificar-cliente] Pedido ${pedido_id}: sem push_subscription — pulando.`);
      return new Response(
        JSON.stringify({ ok: true, skipped: "sem subscription" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidPublic  = Deno.env.get("VAPID_PUBLIC_KEY")  ?? "";
    const vapidEmail   = Deno.env.get("VAPID_EMAIL")       ?? "mailto:admin@minhaloja.com";

    if (!vapidPrivate || !vapidPublic) {
      console.error("[notificar-cliente] VAPID keys não configuradas nas env vars.");
      return new Response(
        JSON.stringify({ error: "VAPID não configurado" }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Usa nome da loja do banco (não mais hardcoded)
    const nomeLoja = cfgLoja?.nome_restaurante || "Sua Loja";

    const pushPayload = JSON.stringify({
      title: msg.title.replace("Pedido", `Pedido #${pedido_id}`),
      body:  msg.body,
      tag:   `pedido-${pedido_id}`,
      loja:  nomeLoja,
      url:   "/",
    });

    const result = await enviarWebPush(
      pedido.push_subscription as { endpoint: string; keys: { p256dh: string; auth: string } },
      pushPayload,
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

    return new Response(
      JSON.stringify({ ok: result.ok, status: result.status }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[notificar-cliente] Erro inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
