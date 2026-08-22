type LogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

function AurexisMark({ size }: { size: number }) {
  const width = Math.round(size * (405 / 392));

  return (
    <img
      className='logo-mark'
      src='/brand/aurexis-mark.svg'
      width={width}
      height={size}
      alt=''
      aria-hidden='true'
      draggable={false}
    />
  );
}

export default function Logo({
  size = 36,
  showText = true,
  className = '',
}: LogoProps) {
  return (
    <span className={`logo ${className}`.trim()}>
      <AurexisMark size={size} />
      {showText && <span className='logo-word'>AUREXIS</span>}
    </span>
  );
}
