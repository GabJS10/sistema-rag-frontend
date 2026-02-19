# Plan de Implementación de WebSockets

Este documento detalla la estrategia para conectar el frontend con el backend mediante WebSockets, permitiendo la autenticación a través de un token y soportando streaming de respuestas con feedback detallado (status, sources, tokens).

## 1. Configuración de Constantes
**Archivo:** `lib/constants.ts` (Completado)

Se añadió la constante `WS_URL` derivada de la `API_URL` existente.
- **Lógica:**
  - Reemplazar el protocolo `http` por `ws`.
  - Ajustar la ruta para apuntar a `/supabase/ws`.

## 2. API Route para Obtención de Token
**Archivo:** `app/api/auth/token/route.ts` (Completado)

Endpoint seguro para exponer el token HttpOnly al cliente.
- **Funcionalidad:**
  - Lee la cookie `access_token`.
  - Retorna `{ token: "..." }`.

## 3. Hook Personalizado `useWebSocket`
**Archivo:** `hooks/use-websocket.ts` (Completado)

Hook que encapsula la conexión, autenticación y gestión de estado del WebSocket.

## 4. Integración en `ChatArea` (Streaming)
**Archivo:** `components/chat/chat-area.tsx` (Completado)

Transformar el componente visual en una interfaz de chat real con soporte para respuestas por streaming y feedback de procesos.

### 4.1. Lógica de Negocio
- **Estructura de Mensaje Extendida:**
  ```typescript
  interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    sources?: string[]; // Para mostrar documentos usados
    status?: string;    // Para mostrar estado actual (ej: "Buscando documentos...")
  }
  ```
- **Protocolo de Envío:**
  - Formato JSON esperado por el backend (`AskSupabaseModel`):
    ```json
    {
      "question": "string",
      "top_k": 2,
      "conversation_id": null, // TODO: Gestionar persistencia si el backend devuelve ID
      "re_rank": false,
      "variants": false
    }
    ```
- **Protocolo de Recepción (Streaming):**
  - El backend envía eventos JSON: `{ "type": "...", "data": "..." }`.
  - `type: "status"`: Actualización de estado (ej: "Analizando historial..."). Mostrar como feedback visual.
  - `type: "sources"`: Lista de nombres de documentos (`data: string[]`). Guardar en el mensaje.
  - `type: "token"`: Fragmento de respuesta (`data: string`). Concatenar.
  - `type: "done"`: Finalización.
  - `type: "error"`: Notificación de fallo.

### 4.2. Cambios en UI
- **Lista de Mensajes:** 
  - Reemplazar el Hero Section ("System Ready") con un `ScrollArea` (usando `@radix-ui/react-scroll-area` si está disponible, o CSS).
  - Renderizar mensajes de usuario (derecha) y asistente (izquierda).
- **Feedback Visual:**
  - Mostrar el `status` actual ("Thinking...") mientras se genera la respuesta.
  - Mostrar "Sources" (chips/badges) al final del mensaje del asistente.
- **Input:** 
  - Conectar `Textarea` y botón enviar.
  - Deshabilitar mientras `isStreaming` es true (opcional, o encolar).

## 5. Pruebas y Pulido (Próximo Paso)
- Verificar flujo completo: Conexión -> Envío -> Status -> Sources -> Tokens -> Done.
- Validar el auto-scroll al recibir nuevos tokens.
- Manejo de desconexiones.
