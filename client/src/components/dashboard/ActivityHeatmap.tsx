import { useState } from "react";

// Monday-first rows; `day` indexes heatmap[], where Sunday = 0.
const ROWS = [
  { label: "Mon", day: 1 },
  { label: "Tue", day: 2 },
  { label: "Wed", day: 3 },
  { label: "Thu", day: 4 },
  { label: "Fri", day: 5 },
  { label: "Sat", day: 6 },
  { label: "Sun", day: 0 },
];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Sequential: one hue (shu), light → dark by opacity on the ink surface.
const LEVELS = [
  "rgb(var(--paper) / 0.05)",
  "rgb(var(--shu) / 0.22)",
  "rgb(var(--shu) / 0.42)",
  "rgb(var(--shu) / 0.68)",
  "rgb(var(--shu) / 1)",
];

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
const plural = (n: number) => `${n} message${n === 1 ? "" : "s"}`;

interface ActivityHeatmapProps {
  heatmap: number[][];
}

const ActivityHeatmap = ({ heatmap }: ActivityHeatmapProps) => {
  const [hover, setHover] = useState<{ day: number; hour: number } | null>(null);
  const max = Math.max(0, ...heatmap.flat());
  const level = (v: number) => (v === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((v / max) * 4)));

  let peak = { day: 0, hour: 0, v: 0 };
  heatmap.forEach((row, day) =>
    row.forEach((v, hour) => {
      if (v > peak.v) peak = { day, hour, v };
    })
  );

  const peakText =
    peak.v > 0
      ? `Busiest: ${DAY_NAMES[peak.day]}s around ${hourLabel(peak.hour)} (${plural(peak.v)})`
      : "No activity in this range yet.";
  const caption = hover
    ? `${DAY_NAMES[hover.day]} · ${hourLabel(hover.hour)}–${hourLabel((hover.hour + 1) % 24)} — ${plural(heatmap[hover.day][hover.hour])}`
    : peakText;

  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: "2.25rem repeat(24, minmax(0, 1fr))" }}
        role="img"
        aria-label={`Messages by weekday and hour. ${peakText}`}
        onPointerLeave={() => setHover(null)}
      >
        {ROWS.map(({ label, day }) => (
          <div key={label} className="contents">
            <span className="self-center font-mono text-[10px] text-paper-faint">{label}</span>
            {heatmap[day].map((v, hour) => (
              <span
                key={hour}
                className="heat-cell"
                style={{ background: LEVELS[level(v)] }}
                data-active={hover?.day === day && hover?.hour === hour}
                onPointerEnter={() => setHover({ day, hour })}
                onPointerDown={() => setHover({ day, hour })}
              />
            ))}
          </div>
        ))}
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="text-center font-mono text-[9.5px] text-paper-faint">
            {h % 6 === 0 ? h : ""}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-paper-dim">{caption}</p>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-paper-faint" aria-hidden="true">
          Less
          {LEVELS.map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} />
          ))}
          More
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
