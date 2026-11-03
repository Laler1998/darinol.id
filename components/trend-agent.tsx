"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CloseIcon } from "./icons";
import { copy, type Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

export function TrendAgent({ topics, language, open, onOpenChange }: { topics: Topic[]; language: Language; open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = copy[language];
  const quickPrompts = [t.agentPromptFast, t.agentPromptWhy, t.agentPromptAngle];
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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
        throw new Error(payload.error ?? t.agentError);
      }

      setAnswer(payload.answer);
      setMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.agentError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="trend-agent-root" aria-label={t.agentLabel}>
      <dialog
        ref={dialogRef}
        className="trend-agent-dialog"
        aria-labelledby="trend-agent-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onOpenChange(false);
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          onOpenChange(false);
        }}
        onClose={() => onOpenChange(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) onOpenChange(false);
        }}
      >
        <div className="trend-agent-panel">
          <header className="trend-agent-header">
            <div>
              <p>{t.agentLabel}</p>
              <h2 id="trend-agent-title">{t.agentTitle}</h2>
              <span>{t.agentDescription}</span>
            </div>
            <button type="button" autoFocus onClick={() => onOpenChange(false)} aria-label={t.agentClose}>
              <CloseIcon />
            </button>
          </header>

          <div className="trend-agent-content">
            {!answer && !error ? (
              <div>
                <p className="trend-agent-section-title">{t.agentQuickStart}</p>
                <div className="trend-agent-prompts">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>
                  ))}
                </div>
              </div>
            ) : null}
            {loading ? <div className="trend-agent-message" aria-live="polite">{t.agentLoading}</div> : null}
            {answer ? <div className="trend-agent-answer">{answer}</div> : null}
            {error ? <div className="trend-agent-error" role="alert">{error}</div> : null}
          </div>

          <form onSubmit={askAgent} className="trend-agent-form">
            <label className="sr-only" htmlFor="trend-agent-message">{t.agentLabel}</label>
            <div>
              <textarea id="trend-agent-message" value={message} onChange={(event) => setMessage(event.target.value.slice(0, 600))} placeholder={t.agentPlaceholder} rows={2} />
              <button type="submit" disabled={!message.trim() || loading}>{loading ? t.agentSending : t.agentSend}</button>
            </div>
            <p>{t.agentFooter}</p>
          </form>
        </div>
      </dialog>

    </aside>
  );
}
