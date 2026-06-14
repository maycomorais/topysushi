// supabase/functions/server-time/index.ts
// Deploy: supabase functions deploy server-time --no-verify-jwt
//
// Retorna a data/hora atual do servidor para evitar que clientes
// manipulem o relógio local do dispositivo para burlar bloqueios.
//
// CORREÇÃO: Paraguai usa UTC-3 permanente desde março de 2024
// (aboliu o horário de verão — Lei 7189/2024).
// A versão anterior usava UTC-4, retornando 1 hora atrasada.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control":                "no-store, no-cache, must-revalidate",
  "Content-Type":                 "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const now = new Date();

  // Paraguai: UTC-3 permanente (Lei 7189/2024 — aboliu horário de verão)
  const PY_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3
  const nowPy = new Date(now.getTime() - PY_OFFSET_MS);

  return new Response(
    JSON.stringify({
      iso:       now.toISOString(),              // "2025-05-13T21:00:00.000Z"
      ts:        now.getTime(),                  // Unix ms
      date_utc:  now.toISOString().slice(0, 10), // "2025-05-13"
      date_py:   nowPy.toISOString().slice(0, 10), // data local de Assunção
      time_py:   nowPy.toISOString().slice(11, 19), // "18:00:00" hora local PY
      offset:    "-03:00",
    }),
    { headers: CORS }
  );
});
