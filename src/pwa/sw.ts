// sw.ts - Service Worker para notificaciones WebPush

/// <reference lib="webworker" />

// Declarar el contexto del Service Worker
declare const self: ServiceWorkerGlobalScope;

// Interfaces para los datos de notificación
interface NotificationData {
  productId?: string;
  productName?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  timestamp?: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: NotificationData;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  tag?: string;
}

// Configuración por defecto para notificaciones
const DEFAULT_NOTIFICATION_CONFIG = {
  icon: '/icons/app-icon-192.png',
  badge: '/icons/badge-72.png',
  vibrate: [200, 100, 200],
  requireInteraction: false,
  silent: false
};

// Event listener para el evento 'push'
self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] Push Received.', event);

  try {
    // Extraer datos del evento push
    const payload = extractPushPayload(event);
    
    // Mostrar notificación
    event.waitUntil(showNotification(payload));
  } catch (error) {
    console.error('[Service Worker] Error processing push event:', error);
    
    // Mostrar notificación de fallback
    event.waitUntil(showFallbackNotification());
  }
});

// Event listener para clicks en notificaciones
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[Service Worker] Notification click Received.', event);

  // Cerrar la notificación
  event.notification.close();

  // Manejar acciones específicas
  const action = event.action;
  const data = event.notification.data as NotificationData;

  event.waitUntil(handleNotificationClick(action, data));
});

// Event listener para cierre de notificaciones
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  console.log('[Service Worker] Notification closed.', event);
  
  const data = event.notification.data as NotificationData;
  
  // Opcional: Enviar analytics sobre notificaciones cerradas
  if (data?.productId) {
    console.log(`Notification closed for product: ${data.productName}`);
  }
});

// Función para extraer payload del evento push
function extractPushPayload(event: PushEvent): PushNotificationPayload {
  let payload: PushNotificationPayload;

  if (event.data) {
    try {
      // Intentar parsear como JSON
      payload = event.data.json();
    } catch (error) {
      // Si falla, usar como texto plano
      const text = event.data.text();
      payload = {
        title: 'Monitor de Vencimientos',
        body: text || 'Nueva notificación de producto'
      };
    }
  } else {
    // Payload por defecto si no hay datos
    payload = {
      title: 'Monitor de Vencimientos',
      body: 'Nueva notificación de producto'
    };
  }

  return payload;
}

// Función para mostrar la notificación
async function showNotification(payload: PushNotificationPayload): Promise<void> {
  const title = payload.title || 'Monitor de Vencimientos';
  
  // Configurar opciones de notificación
  const options: NotificationOptions = {
    body: payload.body || 'Tienes productos próximos a vencer',
    icon: payload.icon || DEFAULT_NOTIFICATION_CONFIG.icon,
    badge: payload.badge || DEFAULT_NOTIFICATION_CONFIG.badge,
    data: payload.data || {},
    tag: payload.tag || generateNotificationTag(payload.data),
    requireInteraction: payload.requireInteraction || shouldRequireInteraction(payload.data),
    silent: payload.silent || DEFAULT_NOTIFICATION_CONFIG.silent,
    
    // Configuración adicional basada en urgencia
    ...getUrgencyBasedConfig(payload.data?.urgencyLevel)
  };

  // Mostrar la notificación
  await self.registration.showNotification(title, options);
}

// Función para mostrar notificación de fallback
async function showFallbackNotification(): Promise<void> {
  await self.registration.showNotification('Monitor de Vencimientos', {
    body: 'Error procesando notificación, pero tienes productos pendientes de revisar',
    icon: DEFAULT_NOTIFICATION_CONFIG.icon,
    badge: DEFAULT_NOTIFICATION_CONFIG.badge,
    tag: 'fallback-notification',
  });
}

// Función para manejar clicks en notificaciones
async function handleNotificationClick(action: string, data: NotificationData): Promise<void> {
  switch (action) {
    case 'view':
    case 'open':
      // Abrir la aplicación
      await openApp(data?.productId);
      break;
      
    case 'dismiss':
      // No hacer nada, la notificación ya se cerró
      console.log('Notification dismissed by user');
      break;
      
    case 'mark_checked':
      // Marcar producto como revisado (esto requeriría una API call)
      await markProductAsChecked(data?.productId);
      break;
      
    case 'remind_later':
      // Programar recordatorio para más tarde
      await scheduleReminder(data?.productId);
      break;
      
    default:
      // Acción por defecto: abrir la app
      await openApp(data?.productId);
      break;
  }
}

// Función para abrir la aplicación
async function openApp(productId?: string): Promise<void> {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // URL a abrir
  const urlToOpen = productId 
    ? `/?product=${productId}` 
    : '/';

  // Si ya hay una ventana abierta, enfocarla
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      if ('navigate' in client) {
        await (client as any).navigate(urlToOpen);
      }
      return;
    }
  }

  // Si no hay ventana abierta, abrir una nueva
  await self.clients.openWindow(urlToOpen);
}

// Función para marcar producto como revisado
async function markProductAsChecked(productId?: string): Promise<void> {
  if (!productId) return;

  try {
    // Aquí harías una llamada a tu API para marcar el producto como revisado
    await fetch('/api/products/mark-checked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });
    
    console.log(`Product ${productId} marked as checked`);
  } catch (error) {
    console.error('Error marking product as checked:', error);
  }
}

// Función para programar recordatorio
async function scheduleReminder(productId?: string): Promise<void> {
  if (!productId) return;

  try {
    // Aquí harías una llamada a tu API para programar un recordatorio
    await fetch('/api/products/schedule-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        productId,
        remindAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 horas después
      })
    });
    
    console.log(`Reminder scheduled for product ${productId}`);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
  }
}

// Función para generar tag único para notificaciones
function generateNotificationTag(data?: NotificationData): string {
  if (data?.productId) {
    return `product-${data.productId}`;
  }
  return `expiry-notification-${Date.now()}`;
}

// Función para determinar si requiere interacción del usuario
function shouldRequireInteraction(data?: NotificationData): boolean {
  if (!data?.urgencyLevel) return false;
  
  return data.urgencyLevel === 'HIGH' || data.urgencyLevel === 'CRITICAL';
}

// Función para obtener acciones por defecto
function getDefaultActions(data?: NotificationData): NotificationAction[] {
  const actions: NotificationAction[] = [
    { action: 'view', title: '👁️ Ver Producto' }
  ];

  // Agregar acciones específicas según urgencia
  if (data?.urgencyLevel === 'CRITICAL' || data?.daysUntilExpiry !== undefined && data.daysUntilExpiry <= 0) {
    actions.push({ action: 'mark_checked', title: '✅ Marcar Revisado' });
  } else {
    actions.push(
      { action: 'remind_later', title: '⏰ Recordar Después' },
      { action: 'dismiss', title: '❌ Descartar' }
    );
  }

  return actions;
}

// Función para configuración basada en urgencia
function getUrgencyBasedConfig(urgencyLevel?: string): Partial<NotificationOptions> {
  switch (urgencyLevel) {
    case 'CRITICAL':
      return {
        requireInteraction: true,
        silent: false
      };
      
    case 'HIGH':
      return {
        requireInteraction: true,
        silent: false
      };
      
    case 'MEDIUM':
      return {
        requireInteraction: false,
        silent: false
      };
      
    case 'LOW':
      return {
        requireInteraction: false,
        silent: true
      };
      
    default:
      return {
        requireInteraction: false,
        silent: DEFAULT_NOTIFICATION_CONFIG.silent
      };
  }
}

// Event listener para instalación del Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Install');
  
  // Forzar activación inmediata
  self.skipWaiting();
});

// Event listener para activación del Service Worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activate');
  
  // Tomar control inmediato de todas las páginas
  event.waitUntil(self.clients.claim());
});

// Exportar para uso en tests (opcional)
export {};

// Configuración TypeScript para compilar
/* 
tsconfig.json para Service Worker:

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "WebWorker"],
    "module": "ES2020",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "sourceMap": true
  },
  "include": ["sw.ts"],
  "exclude": ["node_modules"]
}
*/

/*
Para compilar:
npx tsc sw.ts --target ES2020 --lib ES2020,WebWorker --outDir ./public

Para registrar en React:
navigator.serviceWorker.register('/sw.js')
*/