import type { SVGProps } from "react";

export function TrendsetterProLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 17L9 11l4 4 8-8" />
      <polyline points="15 7 21 7 21 13" />
    </svg>
  );
}
