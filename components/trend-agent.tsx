"use client";

import { FormEvent, useState } from "react";
import { CloseIcon } from "./icons";
import type { Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

const quickPrompts = [
  "Apa yang paling cepat naik hari ini?",
  "Mengapa topik ini mendapat perhatian?",
  "Apa angle konten yang bisa dibuat dari tren ini?",
];

export function TrendAgent({ topics, language }: { topics: Topic[]; language: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askAgent(event: FormEvent) {
    event.preventDefault();
    const question = message.trim();
    if (!question || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, topics }),
      });
      const payload = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error ?? "Agent belum dapat menjawab.");
      }

      setAnswer(payload.answer);
      setMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Agent belum dapat menjawab.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      className="fixed right-4 z-50 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
      aria-label="Tanya Radar"
    >
      {isOpen ? (
        <div className="mb-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-darinol-border bg-darinol-surface shadow-[0_18px_50px_rgba(8,12,16,0.35)]">
          <header className="flex items-start justify-between gap-4 border-b border-darinol-border/70 bg-darinol-surfaceRaised px-4 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-darinol-primaryInk">Tanya Radar</p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-darinol-text">Ajukan pertanyaan tentang tren</h2>
              <p className="mt-1 text-xs text-darinol-muted">Jawaban ditarik dari topik yang sedang aktif di radar.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup Tanya Radar" className="tap-target grid h-9 w-9 shrink-0 place-items-center rounded-full text-darinol-muted transition hover:bg-darinol-border/40 hover:text-darinol-text">
              <CloseIcon />
            </button>
          </header>

          <div className="max-h-[min(60vh,460px)] space-y-4 overflow-y-auto p-4">
            {!answer && !error ? (
              <div>
                <p className="text-sm font-semibold text-darinol-text">Mulai dari pertanyaan cepat</p>
                <div className="mt-3 grid gap-2">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setMessage(prompt)} className="rounded-xl border border-darinol-border/80 bg-darinol-background px-3 py-2.5 text-left text-xs font-medium leading-5 text-darinol-text transition hover:border-darinol-primary/60 hover:bg-darinol-primary/5">{prompt}</button>
                  ))}
                </div>
              </div>
            ) : null}
            {loading ? <div className="rounded-xl bg-darinol-background px-3 py-3 text-sm text-darinol-muted" aria-live="polite">Menganalisis radar...</div> : null}
            {answer ? <div className="whitespace-pre-wrap rounded-xl border border-darinol-primary/20 bg-darinol-primary/5 px-3.5 py-3 text-sm leading-6 text-darinol-text">{answer}</div> : null}
            {error ? <div role="alert" className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-3 text-sm leading-6 text-darinol-text">{error}</div> : null}
          </div>

          <form onSubmit={askAgent} className="border-t border-darinol-border/70 p-3">
            <label className="sr-only" htmlFor="trend-agent-message">Tanya Radar</label>
            <div className="flex items-end gap-2 rounded-xl border border-darinol-border bg-darinol-background p-1.5 focus-within:border-darinol-primary/70">
              <textarea id="trend-agent-message" value={message} onChange={(event) => setMessage(event.target.value.slice(0, 600))} placeholder="Tanya tentang topik yang sedang naik..." rows={2} className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-darinol-text outline-none placeholder:text-darinol-muted" />
              <button type="submit" disabled={!message.trim() || loading} className="tap-target min-h-11 rounded-lg bg-darinol-primaryFill px-3 text-xs font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "..." : "Kirim"}</button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-4 text-darinol-muted">Jawaban dihasilkan otomatis dari data radar yang sedang aktif.</p>
          </form>
        </div>
      ) : null}

      <button type="button" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen} aria-label={isOpen ? "Tutup Tanya Radar" : "Buka Tanya Radar"} className="ml-auto flex min-h-11 items-center gap-2 rounded-full bg-darinol-surfaceRaised px-3.5 text-sm font-semibold text-darinol-text shadow-[0_10px_30px_rgba(8,12,16,0.35)] transition hover:-translate-y-0.5">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-darinol-primary text-[10px] font-bold text-white">AI</span>
        <span>{isOpen ? "Tutup" : "Tanya Radar"}</span>
      </button>
    </aside>
  );
}
