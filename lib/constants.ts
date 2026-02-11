export const API_URL = process.env.API_URL || "http://127.0.0.1:8000/api";

export const WS_URL = API_URL.replace(/^http/, "ws") + "/supabase/ws";

