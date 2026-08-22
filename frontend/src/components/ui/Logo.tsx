type LogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

function AurexisMark({ size }: { size: number }) {
  const width = Math.round(size * 1.11);

  return (
    <svg
      className="logo-mark"
      width={width}
      height={size}
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="aurexis-logo-gradient"
          x1="34"
          y1="18"
          x2="178"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--brand-cyan)" />
          <stop offset="0.34" stopColor="var(--brand-blue)" />
          <stop offset="0.68" stopColor="var(--brand-indigo)" />
          <stop offset="1" stopColor="var(--brand-violet)" />
        </linearGradient>
      </defs>

      <path
        d="M28 151V111L126 18V55L55 132L28 151Z"
        fill="url(#aurexis-logo-gradient)"
      />

      <path
        d="M96 92L116 70L150 104L140 138L96 92Z"
        fill="url(#aurexis-logo-gradient)"
      />

      <rect
        x="160"
        y="111"
        width="28"
        height="28"
        rx="1.5"
        fill="url(#aurexis-logo-gradient)"
      />
    </svg>
  );
}

export default function Logo({
  size = 36,
  showText = true,
  className = "",
}: LogoProps) {
  return (
    <span className={`logo ${className}`.trim()}>
      <AurexisMark size={size} />

      {showText && (
        <span className="logo-word" aria-label="AUREXIS">
          AUREXIS
        </span>
      )}
    </span>
  );
}
