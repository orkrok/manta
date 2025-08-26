import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatSample from "./Chat"; // 기존 챗봇 컴포넌트

export default function ChatFloating() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 고정 아이콘 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[100] bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg p-3 transition-all"
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* 챗봇 창 */}
      {open && (
        <div className="fixed bottom-20 right-6 z-[100]">
          <ChatSample />
        </div>
      )}
    </>
  );
}