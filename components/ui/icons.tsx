import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  "aria-hidden": true,
  focusable: false,
  fill: "none",
  viewBox: "0 0 16 16",
  xmlns: "http://www.w3.org/2000/svg",
} as const;

export function ArrowDownIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...shared} {...props} className={className}>
      <path d="M8 2.5v10M4.5 9 8 12.5 11.5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

export function ArrowUpIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...shared} {...props} className={className}>
      <path d="M8 13.5v-10M4.5 7 8 3.5 11.5 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...shared} {...props} className={className}>
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

export function ReturnIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...shared} {...props} className={className}>
      <path d="M12.5 3.5v3A2.5 2.5 0 0 1 10 9H3.5M6.5 6 3.5 9l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}
