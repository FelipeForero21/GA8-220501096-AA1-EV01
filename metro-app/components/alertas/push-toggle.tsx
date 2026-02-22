"use client";

/**
 * Componente para activar/desactivar notificaciones Web Push
 * Solicita permiso al navegador y registra la suscripción en el servidor.
 */

import { useState, useEffect } from "react";

export function PushToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar soporte de Web Push al montar
  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  /** Verifica si ya existe una suscripción push activa */
  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      // Service worker no registrado aún
    }
  }

  /** Suscribirse a notificaciones push */
  async function subscribe() {
    setLoading(true);
    try {
      // 1. Solicitar permiso al usuario
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      // 2. Registrar service worker si no existe
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 3. Crear suscripción push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // 4. Enviar suscripción al servidor
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (res.ok) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error al suscribirse:", error);
    } finally {
      setLoading(false);
    }
  }

  /** Cancelar suscripción push */
  async function unsubscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Eliminar del servidor
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // Cancelar en el navegador
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Error al desuscribirse:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="rounded-md bg-gray-50 p-3 text-xs text-muted-foreground">
        Tu navegador no soporta notificaciones push
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div>
        <p className="text-sm font-medium">Notificaciones Push</p>
        <p className="text-xs text-muted-foreground">
          {isSubscribed
            ? "Recibirás alertas incluso con el navegador cerrado"
            : "Activa para recibir alertas de retrasos y cierres"}
        </p>
      </div>
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
          isSubscribed
            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
            : "bg-metro-red text-white hover:bg-metro-red/90"
        }`}
      >
        {loading
          ? "..."
          : isSubscribed
            ? "Desactivar"
            : "Activar"}
      </button>
    </div>
  );
}
