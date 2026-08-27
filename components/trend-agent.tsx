"use client";

import { FormEvent, useState } from "react";
import type { Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

const quickPrompts = [
  "Topik mana yang paling siap jadi konten hari ini?",
  "Kenapa topik dengan skor tertinggi sedang naik?",
  "Buat 3 angle konten dari tren yang paling kuat.",
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
    <aside className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6" aria-label="Darinol Radar Assistant">
      {isOpen ? (
        <div className="mb-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-darinol-border bg-darinol-surface shadow-[0_18px_50px_rgba(35,37,42,0.18)]">
          <header className="flex items-start justify-between gap-4 border-b border-darinol-border/70 bg-darinol-text px-4 py-4 text-darinol-background">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-darinol-primary">Darinol AI</p>
              <h2 className="mt-1 font-heading text-lg font-bold">Radar Assistant</h2>
              <p className="mt-1 text-xs text-darinol-background/70">Analisis topik yang sedang terlihat di radar.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup Radar Assistant" className="tap-target grid h-9 w-9 place-items-center rounded-full text-xl leading-none text-darinol-background/70 transition hover:bg-darinol-background/10 hover:text-darinol-background">x</button>
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
            <label className="sr-only" htmlFor="trend-agent-message">Tanya Radar Assistant</label>
            <div className="flex items-end gap-2 rounded-xl border border-darinol-border bg-darinol-background p-1.5 focus-within:border-darinol-primary/70">
              <textarea id="trend-agent-message" value={message} onChange={(event) => setMessage(event.target.value.slice(0, 600))} placeholder="Tanya tentang tren..." rows={2} className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-darinol-text outline-none placeholder:text-darinol-muted" />
              <button type="submit" disabled={!message.trim() || loading} className="tap-target min-h-11 rounded-lg bg-darinol-primaryFill px-3 text-xs font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "..." : "Kirim"}</button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-4 text-darinol-muted">Jawaban dibuat dari data radar yang sedang aktif.</p>
          </form>
        </div>
      ) : null}

      <button type="button" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen} aria-label={isOpen ? "Tutup Radar Assistant" : "Buka Radar Assistant"} className="ml-auto flex min-h-12 items-center gap-2 rounded-full bg-darinol-text px-4 text-sm font-bold text-darinol-background shadow-[0_10px_30px_rgba(35,37,42,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(35,37,42,0.26)]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-darinol-primary text-xs text-white">AI</span>
        <span>{isOpen ? "Tutup" : "Tanya Radar"}</span>
      </button>
    </aside>
  );
}
