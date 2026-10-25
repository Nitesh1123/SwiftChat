import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { DailyActivity } from "@/types/stats.types";
import { formatDay, niceCeil, useElementWidth } from "./useChartHelpers";

type SeriesKey = "sent" | "received";

const SERIES: { key: SeriesKey; label: string; color: string; swatch: string }[] = [
  { key: "sent", label: "Sent", color: "rgb(var(--shu))", swatch: "bg-shu" },
  { key: "received", label: "Received", color: "rgb(var(--ai))", swatch: "bg-ai" },
];

const HEIGHT = 230;
const PAD = { top: 16, right: 56, bottom: 28, left: 34 };

interface ActivityChartProps {
  daily: DailyActivity[];
}

const ActivityChart = ({ daily }: ActivityChartProps) => {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [view, setView] = useState<"chart" | "table">("chart");

  const visible = SERIES.filter((s) => !hidden.has(s.key));
  const n = daily.length;
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const step = n > 1 ? innerW / (n - 1) : 0;

  const yMax = useMemo(
    () => niceCeil(Math.max(0, ...daily.flatMap((d) => visible.map((s) => d[s.key])))),
    [daily, visible]
  );
  const x = (i: number) => PAD.left + i * step;
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;

  const pathFor = (key: SeriesKey) =>
    daily.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const areaFor = (key: SeriesKey) =>
    `${pathFor(key)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

  const toggle = (key: SeriesKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      // Never hide the last visible series — an empty plot reads as "no data".
      else if (next.size < SERIES.length - 1) next.add(key);
      return next;
    });

  const onPointerMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round((e.clientX - rect.left) / (step || 1));
    setActive(Math.max(0, Math.min(n - 1, i)));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setActive((i) => Math.min(n - 1, (i ?? -1) + 1));
    else if (e.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? n) - 1));
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  };

  // Label roughly every ~90px, always including the last day.
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 90))));
  const xLabels = daily
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % labelEvery === 0 || i === n - 1)
    .filter(({ i }, idx, arr) => i === n - 1 || arr[idx + 1]?.i - i >= labelEvery * 0.6);

  const point = active !== null ? daily[active] : null;
  const last = daily[n - 1];

  // End labels: keep at least 12px between them so close values don't collide.
  const endLabels = visible
    .map((s) => ({ s, y: y(last[s.key]) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < endLabels.length; i++) {
    endLabels[i].y = Math.max(endLabels[i].y, endLabels[i - 1].y + 12);
  }
  const labelY = (key: SeriesKey) => endLabels.find((l) => l.s.key === key)!.y;

  return (
    <div>
      {/* Legend doubles as the series toggle */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" role="group" aria-label="Series">
          {SERIES.map((s) => {
            const on = !hidden.has(s.key);
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.key)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                  on ? "text-paper hover:bg-paper/5" : "text-paper-faint line-through hover:bg-paper/5"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${s.swatch} ${on ? "" : "opacity-30"}`} />
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="seg" role="tablist" aria-label="Activity view">
          {(["chart", "table"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={view === v ? "on" : ""}>
              {v === "chart" ? "Chart" : "Table"}
            </button>
          ))}
        </div>
      </div>

      {view === "table" ? (
        <div className="max-h-[230px] overflow-y-auto thin-scroll rounded-xl border border-paper/[0.07]">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-ink-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-paper-faint">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Sent</th>
                <th className="px-3 py-2 text-right font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-t border-paper/[0.05]">
                  <td className="px-3 py-1.5 text-paper-dim">{formatDay(d.date, { weekday: "short", month: "short", day: "numeric" })}</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">{d.sent}</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">{d.received}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={wrapRef}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-shu/50 rounded-xl"
          tabIndex={0}
          role="img"
          aria-label={`Messages per day over the last ${n} days. Use left and right arrow keys to inspect days.`}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          {width > 0 && (
            <svg width={width} height={HEIGHT} className="block">
              <defs>
                {SERIES.map((s) => (
                  <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={s.color} stopOpacity="0.22" />
                    <stop offset="1" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>

              {/* Recessive grid: baseline, midline, ceiling */}
              {[0, yMax / 2, yMax].map((v) => (
                <g key={v}>
                  <line x1={PAD.left} x2={PAD.left + innerW} y1={y(v)} y2={y(v)} stroke="rgb(var(--paper) / 0.07)" strokeDasharray={v === 0 ? undefined : "3 4"} />
                  <text x={PAD.left - 8} y={y(v) + 3.5} textAnchor="end" className="fill-paper-faint font-mono text-[10px]">
                    {v}
                  </text>
                </g>
              ))}

              {xLabels.map(({ d, i }) => (
                <text key={d.date} x={x(i)} y={HEIGHT - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-paper-faint font-mono text-[10px]">
                  {formatDay(d.date)}
                </text>
              ))}

              {visible.map((s) => (
                <g key={s.key} className="chart-series">
                  <path d={areaFor(s.key)} fill={`url(#area-${s.key})`} />
                  <path d={pathFor(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                </g>
              ))}

              {/* Direct labels at the line ends (≤ 4 series) */}
              {active === null &&
                visible.map((s) => (
                  <g key={s.key}>
                    <circle cx={x(n - 1)} cy={y(last[s.key])} r={4} fill={s.color} stroke="rgb(var(--ink-1))" strokeWidth={2} />
                    <text x={x(n - 1) + 9} y={labelY(s.key) + 4} className="fill-paper-dim font-mono text-[10.5px]">
                      {last[s.key]}
                    </text>
                  </g>
                ))}

              {point && active !== null && (
                <g pointerEvents="none">
                  <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="rgb(var(--paper) / 0.25)" />
                  {visible.map((s) => (
                    <circle key={s.key} cx={x(active)} cy={y(point[s.key])} r={4.5} fill={s.color} stroke="rgb(var(--ink-1))" strokeWidth={2} />
                  ))}
                </g>
              )}

              {/* Hit area: the whole plot, not just the 2px lines */}
              <rect
                x={PAD.left}
                y={PAD.top}
                width={innerW}
                height={innerH}
                fill="transparent"
                onPointerMove={onPointerMove}
                onPointerDown={onPointerMove}
                onPointerLeave={() => setActive(null)}
              />
            </svg>
          )}

          {point && active !== null && (
            <div
              className="chart-tooltip"
              style={{
                left: Math.min(Math.max(x(active), 80), width - 80),
                top: Math.max(0, Math.min(...visible.map((s) => y(point[s.key])))) - 12,
              }}
            >
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper-faint">
                {formatDay(point.date, { weekday: "short", month: "short", day: "numeric" })}
              </p>
              {visible.map((s) => (
                <p key={s.key} className="mt-1 flex items-center gap-2 text-[13px]">
                  <span className={`h-2 w-2 rounded-full ${s.swatch}`} />
                  <span className="text-paper-dim">{s.label}</span>
                  <span className="ml-auto pl-3 font-mono tabular-nums text-paper">{point[s.key]}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityChart;
