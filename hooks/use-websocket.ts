"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WS_URL } from "@/lib/constants";

interface WebSocketMessage {
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  error: string | null;
}

export function useWebSocket({
  onMessage,
}: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  // Update ref when callback changes to avoid reconnecting
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let ws: WebSocket;

    const connect = async () => {
      try {
        // 1. Obtener token
        const response = await fetch("/api/auth/token");

        if (!response.ok) {
          if (response.status === 401) {
            // No hay sesión activa, no es necesariamente un error crítico del sistema
            console.log("No active session for WebSocket connection");
          } else {
            setError(`Failed to fetch token: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        const token = data.token;

        if (!token) {
          console.error("No token received for WebSocket");
          setError("No auth token available");
          return;
        }

        // 2. Conectar WebSocket
        const wsUrl = `${WS_URL}?token=${token}`;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setLastMessage(parsed);
            if (onMessageRef.current) {
              onMessageRef.current(parsed);
            }
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          console.log("WebSocket disconnected", event.code, event.reason);
        };

        ws.onerror = (event) => {
          console.error("WebSocket error:", event);
          setError("WebSocket connection error");
        };
      } catch (err) {
        console.error("Failed to establish WebSocket connection:", err);
        setError("Failed to establish connection");
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []); // Empty dependency array ensures we only connect once

  const sendMessage = useCallback((message: WebSocketMessage) => {
    console.log("Sending message:", message);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  }, []);

  return { isConnected, lastMessage, sendMessage, error };
}
