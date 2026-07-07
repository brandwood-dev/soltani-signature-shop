import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { MarqueeMessage } from "@/lib/marquee-api";
import { getActiveMarqueeMessages } from "@/lib/marquee-api";

export function TopBar() {
  const [messages, setMessages] = useState<MarqueeMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getActiveMarqueeMessages()
      .then(setMessages)
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((value) => (value + 1) % messages.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [messages.length]);

  if (!messages.length) {
    return null;
  }

  return (
    <div className="border-b border-border/20 bg-black text-[11px] uppercase tracking-[0.14em] text-white overflow-hidden sm:text-[12px] sm:tracking-[0.18em]">
      <div className="container-luxe relative h-10 flex items-center justify-center px-4">
        {messages.map((message, index) => {
          const active = mounted ? index === currentIndex : index === 0;
          const content = (
            <>
              <Sparkles className="h-3 w-3 text-gold shrink-0" />
              <span className="truncate">{message.text}</span>
            </>
          );

          return (
            <div
              key={message.id}
              aria-hidden={!active}
              className={`absolute inset-0 flex items-center justify-center gap-2 px-4 transition-all duration-700 ease-out ${
                active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              {message.link ? (
                <a href={message.link} className="flex min-w-0 items-center justify-center gap-2 hover:text-gold">
                  {content}
                </a>
              ) : (
                <span className="flex min-w-0 items-center justify-center gap-2">{content}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
