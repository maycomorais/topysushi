// supabase/functions/select-filial/index.ts
// DEPLOY: supabase functions deploy select-filial --no-verify-jwt
// POST https://<projeto>.supabase.co/functions/v1/select-filial
// Body: { "lat": -25.2867, "lng": -57.6470 }

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function distanciaOSRM(cLat: number, cLng: number, fLat: number, fLng: number): Promise<number | null> {
  const base = Deno.env.get("OSRM_BASE_URL");
  if (!base) return null;
  try {
    const res = await fetch(`${base}/route/v1/driving/${cLng},${cLat};${fLng},${fLat}?overview=false`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return ((await res.json()).routes?.[0]?.distance || 0) / 1000;
  } catch { return null; }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Use POST." }), { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

  try {
    let body: { lat?: unknown; lng?: unknown };
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Body JSON inválido." }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }); }

    const lat = Number(body.lat), lng = Number(body.lng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)
      return new Response(JSON.stringify({ error: "Coordenadas inválidas." }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: filiais, error: dbErr } = await supa.from("filiais")
      .select("id, nome, endereco, coord_lat, coord_lng, whatsapp, raio_entrega_km, taxa_entrega_base")
      .eq("status", "ativa");

    if (dbErr) return new Response(JSON.stringify({ error: dbErr.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    if (!filiais?.length) return new Response(JSON.stringify({ error: "Sin sucursales activas." }), { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

    const useOSRM = !!Deno.env.get("OSRM_BASE_URL");
    const result = await Promise.all(filiais.map(async (f) => {
      const dH = haversineKm(lat, lng, f.coord_lat, f.coord_lng);
      const dR = (useOSRM && dH < 50) ? await distanciaOSRM(lat, lng, f.coord_lat, f.coord_lng) : null;
      const d  = dR ?? dH;
      return { ...f, distancia_km: Math.round(d * 100) / 100, distancia_rota_km: dR ? Math.round(dR * 100) / 100 : null, dentro_do_raio: d <= f.raio_entrega_km, metodo_distancia: dR ? "osrm" : "haversine" };
    }));
    result.sort((a, b) => a.distancia_km - b.distancia_km);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "desconocido";
    console.log(`[select-filial] (${lat},${lng}) → "${result[0].nome}" ${result[0].distancia_km}km | IP:${ip}`);

    return new Response(JSON.stringify({ filial: result[0], todas_filiais: result, client_ip: ip, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno.", detalle: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
