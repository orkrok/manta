'use client';

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";

const ChatSample = dynamic(() => import("./Chat"), {
  ssr: false,
  loading: () => (
    <div className="w-[360px] h-[560px] rounded-3xl bg-white/10 text-white flex items-center justify-center">
      챗봇 로딩 중...
    </div>
  ),
});

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