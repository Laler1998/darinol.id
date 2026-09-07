"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MINIMUM_DISPLAY_MS = 4200;

export function LoadingOverlay({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(active);
  const [fallback, setFallback] = useState(false);
  const [animationEnded, setAnimationEnded] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setFallback(false);
      setAnimationEnded(false);
      setMinimumElapsed(false);
      return;
    }

    if (!animationEnded || !minimumElapsed) return;

    const timeout = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(timeout);
  }, [active, animationEnded, minimumElapsed]);

  useEffect(() => {
    if (!visible) return;

    const timeout = window.setTimeout(() => setMinimumElapsed(true), MINIMUM_DISPLAY_MS);
    return () => window.clearTimeout(timeout);
  }, [visible]);

  useEffect(() => {
    if (!active && fallback) setAnimationEnded(true);
  }, [active, fallback]);

  if (!visible) return null;

  const leaving = !active && animationEnded && minimumElapsed;

  return (
    <div className={`loading-overlay ${leaving ? "loading-overlay-leaving" : "loading-overlay-active"}`} aria-live="polite" aria-busy={!leaving}>
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
            loop={false}
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
