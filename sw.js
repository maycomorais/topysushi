// ─────────────────────────────────────────────────────────────
//  Service Worker — versão bump força invalidação de cache.
//  Sempre que fizer deploy de novo código:
//    1. Incremente CACHE_NAME (ex: v7, v8…)
//    2. O SW antigo detecta a diferença no activate e apaga os caches velhos.
// ─────────────────────────────────────────────────────────────
const CACHE_NAME = "pastel-v1.1"; // ← bump aqui a cada deploy

const BLOCKED_ORIGINS = [
  "instagram.",
  "fbcdn.net",
  "facebook.com",
  "chrome-extension://",
  "accounts.google.",
];

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/admin.html",
  "/admin.css",
  "/admin.js",
  "/app.js",
  "/style.css",
  "/supabaseClient.js",
  "/turnos.html",
  "/ficha-tecnica.js",
  "/estatisticas.js",
  "/crm.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

// Arquivos JS/HTML principais: sempre Network-First (nunca ficam presos em cache)
const NETWORK_FIRST = [
  "/app.js",
  "/admin.js",
  "/admin.html",
  "/admin.css",
  "/index.html",
  "/atend.html",
  "/turnos.html",
  "/ficha-tecnica.js",
  "/estatisticas.js",
  "/crm.js",
  "/filiais.js",
  "/mensalistas.js",
  "/supabaseClient.js",
  "/style.css",
];

self.addEventListener("install", (event) => {
  // Assume controle imediatamente sem esperar aba fechar
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          ASSETS_TO_CACHE.map((url) => cache.add(url).catch(() => {})),
        ),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          // Apaga TODOS os caches antigos (qualquer nome diferente do atual)
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => {
              console.log("[SW] Removendo cache antigo:", k);
              return caches.delete(k);
            }),
        ),
      )
      .then(() => {
        console.log("[SW] Cache atualizado para:", CACHE_NAME);
        return self.clients.claim();
      }),
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const shouldSkip = BLOCKED_ORIGINS.some((d) => url.includes(d));
  if (shouldSkip) return;
  if (event.request.method !== "GET") return;
  if (url.includes("supabase.co") || url.includes("supabase.io")) return;

  const path = new URL(url).pathname;
  const isNetworkFirst = NETWORK_FIRST.some((f) => path.endsWith(f));

  if (isNetworkFirst) {
    // Network-First: tenta rede, só usa cache se offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const toCache = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, toCache));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((c) => c || new Response("Offline", { status: 503 })),
        ),
    );
    return;
  }

  // Cache-First para assets estáticos (imagens, fontes CDN)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "opaque"
          )
            return response;
          const toCache = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, toCache));
          return response;
        })
        .catch(() => new Response("Offline", { status: 503 }));
    }),
  );
});

// Permite que o novo SW assuma o controle imediatamente via postMessage
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

self.addEventListener("push", (event) => {
  let data = {
    title: "Pedido",
    body: "Seu pedido foi atualizado!",
    icon: "/img/icon-192.png",
    badge: "/img/icon-192.png",
  };

  if (event.data) {
    try {
      Object.assign(data, event.data.json());
    } catch (_) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/img/icon-192.png",
      badge: data.badge || "/img/icon-192.png",
      tag: data.tag || "pedido-update",
      renotify: true,
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
