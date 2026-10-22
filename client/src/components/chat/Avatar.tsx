interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  rounded?: string;
  online?: boolean;
}

// Monogram tiles cycle through the theme's secondary inks.
const tones = [
  "bg-shu/20 text-shu",
  "bg-sora/20 text-sora",
  "bg-matcha/20 text-matcha",
  "bg-kaki/20 text-kaki",
];

const toneFor = (name: string) => {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return tones[Math.abs(hash) % tones.length];
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const isImage = (src?: string | null) =>
  !!src && /^(https?:|data:|\/|blob:)/.test(src);

const Avatar = ({ name = "", src, size = 44, rounded = "rounded-[30%]", online }: AvatarProps) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    {isImage(src) ? (
      <img
        src={src as string}
        alt=""
        className={`h-full w-full object-cover ${rounded} ring-1 ring-paper/10`}
      />
    ) : (
      <div
        className={`flex h-full w-full items-center justify-center font-display ${rounded} ${toneFor(name)} ring-1 ring-inset ring-paper/10`}
        style={{ fontSize: size * 0.44 }}
      >
        {initials(name)}
      </div>
    )}
    {online && (
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-1 bg-matcha" />
    )}
  </div>
);

export default Avatar;
