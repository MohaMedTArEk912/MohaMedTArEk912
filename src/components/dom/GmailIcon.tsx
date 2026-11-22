export function GmailIcon({ size = 17, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2"
        y="4.5"
        width="20"
        height="15"
        rx="2.2"
        fill="#fffaf0"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3.2 6.4 12 13l8.8-6.6"
        stroke="#c5221f"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 18.8V9.2M18.5 18.8V9.2"
        stroke="#c5221f"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
