"use client";

import { ChatArea } from "@/components/chat/chat-area";
import { useConversationMessages } from "@/hooks/use-chat-query";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: messages = [], isLoading } = useConversationMessages(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-zinc-500 font-mono text-sm animate-pulse">
            Retrieving data blocks...
          </p>
        </div>
      </div>
    );
  }

  return <ChatArea conversationId={id} initialMessages={messages} />;
}
