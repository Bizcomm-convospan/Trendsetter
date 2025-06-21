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
      <circle cx="10.5" cy="10.5" r="7.5" />
      <path d="M21 21l-5.2-5.2" />
      <path d="M6 11l3-3 3 3 3-3" />
    </svg>
  );
}
