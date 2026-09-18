import { useState } from 'react';

export interface ChartPoint { x: number; y: number }

/**
 * Small line chart for a single series against a recessive threshold.
 *
 * Deliberately one series per chart: the threshold is a reference line, not a
 * competing category, so it stays muted and dashed rather than taking a hue.
 * Colours are the validated dark-surface steps from the design tokens.
 */
export function RampChart({
  points, threshold, thresholdLabel, seriesLabel, colorVar = '--series-1',
  formatY, yZeroLine = false, markerMonth = null, markerLabel,
}: {
  points: ChartPoint[];
  threshold?: number;
  thresholdLabel?: string;
  seriesLabel: string;
  colorVar?: string;
  formatY: (v: number) => string;
  yZeroLine?: boolean;
  markerMonth?: number | null;
  markerLabel?: string;
}) {
  const [hover, setHover] = useState<ChartPoint | null>(null);

  if (points.length === 0) return null;

  const W = 320, H = 130, PL = 40, PR = 8, PT = 10, PB = 20;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const candidates = [...ys, ...(threshold !== undefined ? [threshold] : []), ...(yZeroLine ? [0] : [])];
  const yMin = Math.min(...candidates);
  const yMax = Math.max(...candidates);
  const span = yMax - yMin || 1;

  const sx = (x: number) => PL + ((x - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs) || 1)) * (W - PL - PR);
  const sy = (y: number) => PT + (1 - (y - yMin) / span) * (H - PT - PB);

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const ticks = [yMin, yMin + span / 2, yMax];

  return (
    <div className="viz">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={seriesLabel}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="grid" x1={PL} x2={W - PR} y1={sy(t)} y2={sy(t)} />
            <text className="axis-label" x={PL - 5} y={sy(t) + 3} textAnchor="end">{formatY(t)}</text>
          </g>
        ))}

        {yZeroLine && yMin < 0 && (
          <line className="grid" x1={PL} x2={W - PR} y1={sy(0)} y2={sy(0)} strokeWidth={1.5} />
        )}

        {threshold !== undefined && (
          <>
            <line className="threshold" x1={PL} x2={W - PR} y1={sy(threshold)} y2={sy(threshold)} />
            {thresholdLabel && (
              <text className="axis-label" x={W - PR} y={sy(threshold) - 4} textAnchor="end">{thresholdLabel}</text>
            )}
          </>
        )}

        {markerMonth !== null && markerMonth !== undefined && markerMonth <= Math.max(...xs) && (
          <>
            <line className="threshold" x1={sx(markerMonth)} x2={sx(markerMonth)} y1={PT} y2={H - PB} />
            {markerLabel && (
              <text className="axis-label" x={sx(markerMonth) + 3} y={PT + 8}>{markerLabel}</text>
            )}
          </>
        )}

        <path className="series-line" d={path} stroke={`var(${colorVar})`} />

        {hover && (
          <circle className="marker" cx={sx(hover.x)} cy={sy(hover.y)} r={4.5} fill={`var(${colorVar})`} />
        )}

        {points.map((p) => (
          <rect key={p.x} className="hit"
            x={sx(p.x) - 6} y={PT} width={12} height={H - PT - PB}
            onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)}
            onTouchStart={() => setHover(p)} />
        ))}

        <text className="axis-label" x={PL} y={H - 5}>M{Math.min(...xs)}</text>
        <text className="axis-label" x={W - PR} y={H - 5} textAnchor="end">M{Math.max(...xs)}</text>
      </svg>

      <div className="viz-legend">
        <span><i className="viz-swatch" style={{ background: `var(${colorVar})` }} />{seriesLabel}</span>
        {thresholdLabel && (
          <span><i className="viz-swatch" style={{ background: 'var(--muted)' }} />{thresholdLabel}</span>
        )}
      </div>
      <div className="viz-readout">
        {hover ? `Month ${hover.x}: ${formatY(hover.y)}` : 'Tap or hover a month for its value.'}
      </div>
    </div>
  );
}
