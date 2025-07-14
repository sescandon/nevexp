import React, { useState, useEffect } from "react";

interface WebPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface Product {
  productName: string;
  expiryDate: string;
  webPushSubscription: WebPushSubscription;
}

const WebPushComponent: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [status, setStatus] = useState<string>("Verificando soporte...");
  const [productName, setProductName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  // VAPID Public Key - Reemplaza con tu clave real
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  useEffect(() => {
    initializeWebPush();
    setDefaultDate();
  }, []);

  const setDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpiryDate(tomorrow.toISOString().split("T")[0]);
  };

  const initializeWebPush = async () => {
    try {
      // Verificar soporte
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("WebPush no soportado en este navegador");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("Notificaciones bloqueadas");
        return;
      }

      // Esperar a que el Service Worker esté listo (asumimos que ya está registrado)
      const registration = await navigator.serviceWorker.ready;

      // Verificar suscripción existente
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        setStatus("Ya estás suscrito a notificaciones");
      } else {
        setStatus("Listo para suscribirse");
      }
    } catch (error) {
      console.error("Error inicializando WebPush:", error);
      setStatus("Error inicializando WebPush");
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Permisos denegados");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        setStatus("Push Manager no disponible");
        return;
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY), //Type error but still works xd
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);
      setStatus("Suscrito exitosamente");

      console.log("Nueva suscripción:", getSubscriptionData(newSubscription));
    } catch (error) {
      console.error("Error suscribiéndose:", error);
      setStatus("Error al suscribirse");
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
        setStatus("Desuscrito exitosamente");
      }
    } catch (error) {
      console.error("Error desuscribiéndose:", error);
      setStatus("Error al desuscribirse");
    }
  };

  const addProduct = () => {
    if (!productName || !expiryDate) {
      setStatus("Completa todos los campos");
      return;
    }

    if (!subscription) {
      setStatus("Primero suscríbete a notificaciones");
      return;
    }

    const product: Product = {
      productName,
      expiryDate,
      webPushSubscription: getSubscriptionData(subscription),
    };

    console.log("Producto a agregar:", product);
    setStatus(`Producto "${productName}" agregado (simulado)`);

    // Limpiar formulario
    setProductName("");
    setDefaultDate();
  };

  const sendTestNotification = async (
    type: "today" | "tomorrow" | "expired" | "future"
  ) => {
    if (!subscription) {
      setStatus("Primero suscríbete a notificaciones");
      return;
    }

    const notifications = {
      today: {
        title: "⚠️ VENCE HOY",
        body: "Yogur Griego vence hoy",
        requireInteraction: true,
      },
      tomorrow: {
        title: "🔔 VENCE MAÑANA",
        body: "Leche Descremada vence mañana",
        requireInteraction: true,
      },
      expired: {
        title: "🚨 PRODUCTO VENCIDO",
        body: "Pan Integral venció hace 1 día",
        requireInteraction: true,
      },
      future: {
        title: "📅 PRÓXIMO A VENCER",
        body: "Queso Mozzarella vence en 5 días",
        requireInteraction: false,
      },
    };

    const notificationData = notifications[type];

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍎</text></svg>',
        badge:
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚠️</text></svg>',
        requireInteraction: notificationData.requireInteraction,
        tag: "test-notification",
      });

      setStatus(`Notificación de prueba enviada: ${notificationData.title}`);
    } catch (error) {
      console.error("Error enviando notificación:", error);
      setStatus("Error enviando notificación de prueba");
    }
  };

  const getSubscriptionData = (sub: PushSubscription): WebPushSubscription => {
    const p256dhKey = sub.getKey("p256dh");
    const authKey = sub.getKey("auth");

    return {
      endpoint: sub.endpoint,
      p256dh: p256dhKey ? arrayBufferToBase64(p256dhKey) : "",
      auth: authKey ? arrayBufferToBase64(authKey) : "",
    };
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let result = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      result += String.fromCharCode(bytes[i]);
    }
    return window.btoa(result);
  };

  return (
    <div>
      <h1>Monitor de Vencimientos - WebPush</h1>

      <div>
        <strong>Estado: </strong>
        {status}
      </div>

      <div>
        <h2>Notificaciones</h2>
        <button onClick={subscribeToNotifications} disabled={isSubscribed}>
          Activar Notificaciones
        </button>
        <button onClick={unsubscribeFromNotifications} disabled={!isSubscribed}>
          Desactivar Notificaciones
        </button>
      </div>

      <div>
        <h2>Agregar Producto</h2>
        <div>
          <label>
            Nombre del Producto:
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Leche Descremada"
            />
          </label>
        </div>
        <div>
          <label>
            Fecha de Vencimiento:
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </label>
        </div>
        <button onClick={addProduct}>Agregar Producto</button>
      </div>

      <div>
        <h2>Pruebas de Notificaciones</h2>
        <button onClick={() => sendTestNotification("today")}>
          Test: Vence Hoy
        </button>
        <button onClick={() => sendTestNotification("tomorrow")}>
          Test: Vence Mañana
        </button>
        <button onClick={() => sendTestNotification("expired")}>
          Test: Ya Vencido
        </button>
        <button onClick={() => sendTestNotification("future")}>
          Test: Vence en 5 días
        </button>
      </div>

      {subscription && (
        <div>
          <h2>Información de Suscripción</h2>
          <pre>
            {JSON.stringify(getSubscriptionData(subscription), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WebPushComponent;
