import React from 'react';

interface FixFlowLogoProps {
  className?: string;
  size?: number;
}

export const FixFlowLogo: React.FC<FixFlowLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="logoAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* Main F Structure */}
      <path
        d="M136 136C136 122.7 146.7 112 160 112L352 112C365.3 112 376 122.7 376 136L376 160C376 173.3 365.3 184 352 184L216 184L216 220L320 220C333.3 220 344 230.7 344 244L344 264C344 277.3 333.3 288 320 288L216 288L216 376C216 389.3 205.3 400 192 400L160 400C146.7 400 136 389.3 136 376Z"
        fill="currentColor"
      />
      {/* Dynamic Second Flow Bar */}
      <path
        d="M260 324L356 324C369.3 324 380 334.7 380 348L380 368C380 381.3 369.3 392 356 392L260 392C246.7 392 236 381.3 236 368L236 348C236 334.7 246.7 324 260 324Z"
        fill="currentColor"
      />
      {/* Modern Accent Tech Nodes */}
      <circle cx="396" cy="148" r="14" fill="currentColor" opacity="0.9" />
      <circle cx="368" cy="254" r="12" fill="currentColor" opacity="0.8" />
      <circle cx="406" cy="358" r="12" fill="currentColor" opacity="0.85" />
    </svg>
  );
};
