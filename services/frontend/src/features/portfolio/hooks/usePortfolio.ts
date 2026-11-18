"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect, useCallback } from "react";
import { portfolioService } from "../services/portfolio.service";
import { ChatMessage, ChatSourceItem } from "../types";

export const portfolioKeys = {
  all: ["portfolio"] as const,
  site: (slug: string) => [...portfolioKeys.all, "site", slug] as const,
};

export function usePublicSite(slug: string) {
  return useQuery({
    queryKey: portfolioKeys.site(slug),
    queryFn: () => portfolioService.getPublicSite(slug),
    enabled: !!slug,
  });
}

export function useRecruiterChat(slug: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Hello! I am the verified AI Recruiter Assistant. I answer recruiter questions with 100% ground-truth fidelity from the candidate's approved background, complete with source citations. Ask me about system architecture, latency wins, leadership scope, or tech stack.",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (userMsg: string) => {
      if (!userMsg.trim() || isStreaming) return;

      const trimmed = userMsg.trim();
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setIsStreaming(true);

      // Bot message placeholder
      setMessages((prev) => [...prev, { role: "bot", text: "" }]);

      let botAnswer = "";
      let botSources: ChatSourceItem[] = [];

      try {
        await portfolioService.streamChat(
          slug,
          trimmed,
          (token) => {
            botAnswer += token;
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === "bot") {
                last.text = botAnswer;
                last.sources = botSources;
              }
              return next;
            });
          },
          (sources) => {
            botSources = sources;
          }
        );
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "An error occurred while communicating with the recruiter agent. Please ensure the backend is running.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [slug, isStreaming]
  );

  return {
    messages,
    isStreaming,
    sendMessage,
    chatBottomRef,
  };
}
