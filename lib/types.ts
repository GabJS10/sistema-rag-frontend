export interface Document {
  id: string;
  name: string;
  user_id?: string;
  uploaded_at?: string;
  status?:
    | "completado"
    | "error"
    | "procesando"
    | "embedding"
    | "error_embedding"
    | "embedded";
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string; // Del backend
  timestamp?: Date; // Para uso interno en UI (puede ser derivado de created_at)
  conversation_id?: string;
  isStreaming?: boolean;
  sources?: string[];
  status?: string;
}
