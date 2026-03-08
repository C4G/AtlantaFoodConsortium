'use client';

import { Info } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

const TOOLTIP_WIDTH = 240;
const TOOLTIP_MARGIN = 8;
const SCREEN_EDGE_PADDING = 8;

interface ChartInfoTooltipProps {
  info: string;
  position?: 'top' | 'bottom';
  size?: 'sm' | 'md';
}

interface TooltipCoords {
  top: number;
  left: number;
  openAbove: boolean;
}

export function ChartInfoTooltip({
  info,
  position = 'top',
  size = 'md',
}: ChartInfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calcCoords = useCallback((): TooltipCoords | null => {
    if (!buttonRef.current) return null;
    const btn = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceAbove = btn.top;
    const spaceBelow = vh - btn.bottom;
    const preferAbove = position === 'top';
    const openAbove = preferAbove
      ? spaceAbove >= 80 || spaceAbove >= spaceBelow
      : spaceBelow < 80 && spaceAbove > spaceBelow;

    const top = openAbove
      ? btn.top - TOOLTIP_MARGIN
      : btn.bottom + TOOLTIP_MARGIN;

    const idealLeft = btn.left + btn.width / 2 - TOOLTIP_WIDTH / 2;
    const left = Math.max(
      SCREEN_EDGE_PADDING,
      Math.min(idealLeft, vw - TOOLTIP_WIDTH - SCREEN_EDGE_PADDING)
    );

    return { top, left, openAbove };
  }, [position]);

  const openTooltip = useCallback(() => {
    const c = calcCoords();
    setCoords(c);
    setOpen(true);
  }, [calcCoords]);

  const closeTooltip = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      )
        return;
      closeTooltip();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open, closeTooltip]);

  useEffect(() => {
    if (!open) return;
    const update = () => setCoords(calcCoords());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, calcCoords]);

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <>
      <button
        ref={buttonRef}
        type='button'
        aria-label='More information'
        aria-expanded={open}
        onClick={() => (open ? closeTooltip() : openTooltip())}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        className={`cursor-help rounded-full p-0.5 transition-colors ${
          open ? 'text-slate-600' : 'text-slate-400 hover:text-slate-600'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
      >
        <Info className={iconSize} />
      </button>

      {open && coords && (
        <div
          ref={tooltipRef}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          style={{
            position: 'fixed',
            top: coords.openAbove ? undefined : coords.top,
            bottom: coords.openAbove
              ? window.innerHeight - coords.top
              : undefined,
            left: coords.left,
            width: TOOLTIP_WIDTH,
          }}
          className='z-[9999] rounded-md bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg'
        >
          {info}
          <div
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
              coords.openAbove
                ? 'top-full border-t-slate-800'
                : '-top-2 border-b-slate-800'
            }`}
            style={{
              left: buttonRef.current
                ? buttonRef.current.getBoundingClientRect().left +
                  buttonRef.current.getBoundingClientRect().width / 2 -
                  coords.left
                : '50%',
              transform: 'none',
            }}
          />
        </div>
      )}
    </>
  );
}
