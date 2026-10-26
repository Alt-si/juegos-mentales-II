// Service worker de MenteCuenta: aviso diario de la Palabra del día.
// - "periodicsync": Chrome en Android, con la app instalada, lo dispara cada ~12-24 h (lo decide el sistema).
// - "push": listo para cuando haya un servidor que mande el aviso a una hora fija (por ejemplo, Firebase Cloud Messaging).

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

function avisoDelDia(data = {}) {
  return self.registration.showNotification(data.title || "Palabra del día", {
    body: data.body || "Ya hay una nueva palabra escondida. ¿La descubrís hoy?",
    icon: "icon.svg",
    badge: "icon.svg",
    tag: "palabra-del-dia",
    renotify: false,
  });
}

self.addEventListener("periodicsync", e => {
  if (e.tag === "palabra-del-dia") e.waitUntil(avisoDelDia());
});

self.addEventListener("push", e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil(avisoDelDia(data));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL("./#hoy", self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(wins => {
      for (const w of wins) {
        if ("focus" in w) { if ("navigate" in w) w.navigate(url); return w.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
