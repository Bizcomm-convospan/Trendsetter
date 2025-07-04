import type { SVGProps } from "react";

export function TrendsetterProLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M7 20a2 2 0 0 1-2-2V12a2 2 0 0 1 4 0v6a2 2 0 0 1-2 2z" />
      <path d="M12 20a2 2 0 0 1-2-2V8a2 2 0 0 1 4 0v10a2 2 0 0 1-2 2z" />
      <path d="M17 20a2 2 0 0 1-2-2V4a2 2 0 0 1 4 0v14a2 2 0 0 1-2 2z" />
    </svg>
  );
}
