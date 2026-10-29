import type { SVGProps } from "react";

export const PRESK_COLORS = {
  blue: "#2563EB",
  yellow: "#F5B800",
  white: "#FFFFFF",
} as const;

type Props = Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox"> & {
  size?: number;
  animated?: boolean;
  title?: string;
};

const CSS = `
.presk-front,.presk-play{transform-box:fill-box;transform-origin:center}
.presk-anim .presk-front{animation:presk-front-in .35s cubic-bezier(.2,.8,.2,1) both}
.presk-anim .presk-back{animation:presk-back-in .6s cubic-bezier(.2,.8,.2,1) .25s both}
.presk-anim .presk-play{animation:presk-play-in .4s cubic-bezier(.3,1.4,.5,1) .65s both}
@keyframes presk-front-in{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes presk-back-in{from{transform:translate(-12px,-12px)}to{transform:translate(0,0)}}
@keyframes presk-play-in{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.presk-anim *{animation:none!important}}
`;

export function PreskLogo({
  size = 140,
  animated = false,
  title = "Presk",
  className,
  ...rest
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 172 102"
      width={size}
      height={(size * 102) / 172}
      role="img"
      aria-label={title}
      className={[animated ? "presk-anim" : "", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <title>{title}</title>
      {animated && <style>{CSS}</style>}
      <rect className="presk-back" x="12" y="12" width="160" height="90" rx="12" fill={PRESK_COLORS.yellow} />
      <rect className="presk-front" x="0" y="0" width="160" height="90" rx="12" fill={PRESK_COLORS.blue} />
      <path
        className="presk-play"
        d="M71 27 L71 63 L101 45 Z"
        fill={PRESK_COLORS.white}
        stroke={PRESK_COLORS.white}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PreskIcon({ size = 32, title = "Presk", ...rest }: Omit<Props, "animated">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      {...rest}
    >
      <title>{title}</title>
      <rect x="12" y="21" width="48" height="30" rx="5" fill={PRESK_COLORS.yellow} />
      <rect x="4" y="13" width="48" height="30" rx="5" fill={PRESK_COLORS.blue} />
      <path
        d="M24.5 21.5 L24.5 34.5 L35.5 28 Z"
        fill={PRESK_COLORS.white}
        stroke={PRESK_COLORS.white}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PreskLogo;
