"use client";

const signalRows = [
  { name: "Jakarta", category: "Peristiwa", score: 98, width: "96%" },
  { name: "Bitcoin", category: "Crypto", score: 96, width: "88%" },
  { name: "Kebakaran", category: "Peristiwa", score: 79, width: "68%" },
];

export function HeroProductVisual() {
  return (
    <div className="hero-visual" aria-label="Pratinjau intelligence interface Darinol">
      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

      <div className="hero-console glass-card animate-enter">
        <div className="hero-console-topline">
          <div>
            <span className="eyebrow-text">Darinol intelligence</span>
            <h2>Trend Radar</h2>
          </div>
          <span className="hero-live-badge"><span className="signal-pulse" /> Live</span>
        </div>

        <div className="hero-chart-panel">
          <div className="hero-chart-heading">
            <span>Signal movement</span>
            <strong>+24.8%</strong>
          </div>
          <div className="hero-chart" aria-hidden="true">
            <span className="chart-grid chart-grid-one" />
            <span className="chart-grid chart-grid-two" />
            <span className="chart-line chart-line-back" />
            <span className="chart-line chart-line-front" />
            <i className="chart-point chart-point-one" />
            <i className="chart-point chart-point-two" />
            <i className="chart-point chart-point-three" />
          </div>
          <div className="hero-chart-axis"><span>06.00</span><span>12.00</span><span>18.00</span><span>Now</span></div>
        </div>

        <div className="hero-signal-list">
          <div className="hero-list-heading"><span>Top signals</span><span>Score</span></div>
          {signalRows.map((signal, index) => (
            <div className="hero-signal-row" key={signal.name}>
              <span className="hero-rank">0{index + 1}</span>
              <span className="hero-signal-name"><strong>{signal.name}</strong><small>{signal.category}</small></span>
              <span className="hero-signal-meter"><i style={{ width: signal.width }} /></span>
              <strong className="hero-score">{signal.score}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
