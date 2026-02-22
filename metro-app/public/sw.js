/**
 * Service Worker para notificaciones Web Push
 * Intercepta notificaciones push y las muestra al usuario.
 * Se registra desde el componente PushToggle.
 */

// Recibir notificación push
self.addEventListener("push", function (event) {
  if (!event.data) return;

  const payload = event.data.json();

  const options = {
    body: payload.body || "Nueva alerta del Metro de Medellín",
    icon: payload.icon || "/icons/metro-icon.png",
    badge: "/icons/metro-badge.png",
    tag: payload.tag || "metro-alert",
    data: {
      url: payload.url || "/alertas",
    },
    // Vibración: patrón corto para alertas
    vibrate: [200, 100, 200],
    // Acciones disponibles en la notificación
    actions: [
      { action: "view", title: "Ver detalle" },
      { action: "dismiss", title: "Descartar" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title || "Metro de Medellín",
      options
    )
  );
});

// Manejar clic en la notificación
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "dismiss") return;

  // Abrir la URL de la alerta o ir a la página de alertas
  const url = event.notification.data?.url || "/alertas";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
