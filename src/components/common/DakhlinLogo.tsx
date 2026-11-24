// src/components/common/DakhlinLogo.tsx
import React from 'react';

interface Props {
  className?: string;
  symbolSize?: number;
  textColor?: string;
}

/**
 * Official Brand Logo for Dakhlin
 * Reflects the bespoke brand identity kit: Arch portal emblem with dunes & lagoon + modern wordmark.
 */
export const DakhlinLogo: React.FC<Props> = ({
  className = '',
  symbolSize = 32,
  textColor = 'text-[#0E6E77]',
}) => {
  return (
    <div className={`flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      {/* Brand Arch Symbol */}
      <img
        src="/images/logo-symbol.svg"
        alt="Dakhlin Logo"
        width={symbolSize}
        height={Math.round(symbolSize * 1.2)}
        className="object-contain shrink-0"
        loading="eager"
      />

      {/* Official Brand Wordmark */}
      <span className={`font-extrabold text-xl sm:text-2xl tracking-tight leading-none ${textColor}`}>
        Dakhlin
      </span>
    </div>
  );
};
