type LogoProps = {
  size?: number;
  showText?: boolean;
};

export default function Logo({
  size = 36,
  showText = true,
}: LogoProps) {
  return (
    <div className="logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AXION"
      >
        <defs>
          <linearGradient
            id="axion-logo-gradient"
            x1="20"
            y1="90"
            x2="80"
            y2="5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6C33FF" />
            <stop offset="0.58" stopColor="#A77BFF" />
            <stop offset="1" stopColor="#F5F3FF" />
          </linearGradient>
        </defs>

        <path
          d="M50 8L91 88H72L50 45L28 88H9L50 8Z"
          fill="url(#axion-logo-gradient)"
        />

        <circle cx="50" cy="61" r="6" fill="#08080B" />

        <path
          d="M50 70V90"
          stroke="#8B5CF6"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M50 78L39 88"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M50 78L61 88"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="39" cy="88" r="3" fill="#B99AFF" />
        <circle cx="61" cy="88" r="3" fill="#B99AFF" />
        <circle cx="50" cy="90" r="3" fill="#B99AFF" />
      </svg>

      {showText && <span className="logo-word">AXION</span>}
    </div>
  );
}