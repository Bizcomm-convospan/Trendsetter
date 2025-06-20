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
      <path d="M3.5 15.5C5 17 7 18 9.5 18c4 0 7-3 7-7s-3-7-7-7c-.6 0-1.2.1-1.8.2" />
      <path d="m14.5 15.5 4.5-4.5-4.5-4.5" />
      <path d="M3.5 4.5C5 3 7 2 9.5 2c4 0 7 3 7 7s-3 7-7 7c-.6 0-1.2-.1-1.8-.2" />
      <path d="m14.5 4.5 4.5 4.5-4.5 4.5" />
    </svg>
  );
}
