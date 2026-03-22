import React, { useEffect, useState } from 'react';
import { parseElapsedSecs } from '../utils/time';

interface Props {
  lastBlockTime: string;
  targetMinutes?: number;
}

export const BitcoinProgressBar: React.FC<Props> = ({
  lastBlockTime,
  targetMinutes = 10,
}) => {
  const [elapsedSecs, setElapsedSecs] = useState(() =>
    parseElapsedSecs(lastBlockTime),
  );
  const targetSecs = targetMinutes * 60;

  useEffect(() => {
    setElapsedSecs(parseElapsedSecs(lastBlockTime));
    const t = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [lastBlockTime]);

  const pct = Math.min((elapsedSecs / targetSecs) * 100, 100);
  const color =
    pct < 50
      ? 'var(--color-success)'
      : pct < 90
        ? 'var(--color-warning)'
        : 'var(--color-error)';

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  /* Segment count for the pixelated block HP bar */
  const TOTAL_BLOCKS = 20;
  const filledBlocks = Math.round((pct / 100) * TOTAL_BLOCKS);

  return (
    <div>
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--text-dim)',
            letterSpacing: '0.5px',
          }}
        >
          BLOCK AGE
        </span>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color,
            textShadow: `0 0 6px ${color}`,
          }}
        >
          {fmt(elapsedSecs)} / {fmt(targetSecs)}
        </span>
      </div>

      {/* Pixel block HP bar */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          height: '18px',
          padding: '2px',
          background: 'var(--bg)',
          border: '3px solid var(--border)',
          boxShadow: 'inset 2px 2px 0 0 rgba(0,0,0,0.5)',
        }}
      >
        {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '100%',
              background: i < filledBlocks ? color : 'rgba(255,255,255,0.04)',
              boxShadow: i < filledBlocks ? `0 0 4px ${color}` : 'none',
              transition: 'background 0.2s step-start',
            }}
          />
        ))}
      </div>

      {/* Percentage */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--text-dim)',
          marginTop: '4px',
          textAlign: 'center',
        }}
      >
        {pct.toFixed(0)}% OF TARGET
      </div>
    </div>
  );
};
