import React from 'react';

/**
 * Salestrig Studio wordmark (text-based; replaces the upstream Postiz logo, which
 * is a third-party trademark and must not be reproduced). Theme-aware via tokens.
 * A final logo asset can replace this in a later design pass.
 */
export const LogoTextComponent = () => {
  return (
    <div className="flex select-none items-center gap-[10px]">
      <div
        className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px] text-[18px] font-[700] leading-none text-white"
        style={{ background: 'linear-gradient(135deg, #7E4FA8 0%, #4A2C5E 100%)' }}
      >
        S
      </div>
      <div className="flex items-baseline gap-[6px] leading-none">
        <span className="text-[20px] font-[700] tracking-[-0.01em] text-textColor">
          Salestrig
        </span>
        <span className="text-[13px] font-[500] uppercase tracking-[0.2em] text-[#C9A36B]">
          Studio
        </span>
      </div>
    </div>
  );
};
