"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function LoadingOverlay({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(active);
  const [fallback, setFallback] = useState(false);
  const [animationEnded, setAnimationEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setFallback(false);
      setAnimationEnded(false);
      return;
    }

    if (!animationEnded) return;

    const timeout = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(timeout);
  }, [active, animationEnded]);

  useEffect(() => {
    if (!active && fallback) setAnimationEnded(true);
  }, [active, fallback]);

  if (!visible) return null;

  return (
    <div className={`loading-overlay ${active ? "loading-overlay-active" : "loading-overlay-leaving"}`} aria-live="polite" aria-busy={active}>
      <div className="loading-overlay-stage">
        {fallback ? (
          <div className="loading-fallback" role="status">
            <Image src="/darinol-wordmark.png" alt="Darinol" width={540} height={180} priority />
            <div className="loading-fallback-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="sr-only">Mengambil sinyal tren terbaru</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="loading-video"
            autoPlay
            loop={active && !animationEnded}
            muted
            playsInline
            preload="auto"
            onError={() => {
              setFallback(true);
              if (!active) setAnimationEnded(true);
            }}
            onEnded={() => {
              if (active && videoRef.current) {
                videoRef.current.currentTime = 0;
                void videoRef.current.play();
                return;
              }

              setAnimationEnded(true);
            }}
            aria-label="Animasi logo Darinol"
          >
            <source src="/darinol-loading.mp4" type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}
