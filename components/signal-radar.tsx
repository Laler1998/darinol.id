import type { Topic } from "@/lib/types";

type SignalRadarProps = {
  topics: Topic[];
};

const CENTER = 200;
const MAX_RADIUS = 172;

export function SignalRadar({ topics }: SignalRadarProps) {
  const signals = topics.slice(0, 3).map((topic, index) => {
    const angle = (index / Math.max(Math.min(topics.length, 3), 1)) * Math.PI * 2 - Math.PI / 2;
    const score = Math.max(0, Math.min(100, topic.culture_score ?? topic.score));
    const radius = MAX_RADIUS * (1 - score / 100);

    return {
      topic,
      score,
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
    };
  });
  const rankedIds = new Set(signals.map(({ topic }) => topic.id));
  const otherSignals = topics.filter((topic) => !rankedIds.has(topic.id));

  return (
    <figure className="signal-radar mx-auto w-full max-w-[360px] xl:max-w-none">
      <svg viewBox="0 0 400 400" role="img" aria-label="Radar sinyal. Semakin dekat titik ke pusat, semakin tinggi skornya.">
        <g className="radar-sweep">
          <path d="M200 200 L338 84 A180 180 0 0 1 374 153 Z" fill="#FF7A45" fillOpacity="0.25" />
        </g>
        {[60, 120, 180].map((radius) => (
          <circle key={radius} cx={CENTER} cy={CENTER} r={radius} fill="none" stroke="#665044" />
        ))}
        <line x1="20" y1={CENTER} x2="380" y2={CENTER} stroke="#665044" />
        <line x1={CENTER} y1="20" x2={CENTER} y2="380" stroke="#665044" />
        {otherSignals.map((topic, index) => {
          const angle = (index / Math.max(otherSignals.length, 1)) * Math.PI * 2;
          const radius = 54 + (index % 3) * 50;
          return <circle key={topic.id} cx={CENTER + Math.cos(angle) * radius} cy={CENTER + Math.sin(angle) * radius} r="3" fill="#756B62" />;
        })}
        {signals[0] ? <line x1={CENTER} y1={CENTER} x2={signals[0].x} y2={signals[0].y} stroke="#FF7A45" strokeOpacity="0.8" /> : null}
        {signals.map(({ topic, score, x, y }, index) => {
          const color = index === 0 ? "#FF7A45" : "#F4F2EE";
          return (
            <g key={topic.id}>
              <circle cx={x} cy={y} r={index === 0 ? 8 : 6} fill={color} />
              <text x={x + 12} y={y - 3} fill="#E8E6E1" fontSize="11" fontFamily="JetBrains Mono, monospace">{topic.name.slice(0, 16).toUpperCase()}</text>
              <title>{`${topic.name}: ${score}`}</title>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 font-mono text-[10px] leading-relaxed text-darinol-muted">
        Makin dekat ke pusat, makin tinggi skor. Titik abu-abu menunjukkan sinyal lain.
      </figcaption>
    </figure>
  );
}