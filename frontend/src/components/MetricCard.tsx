import React from 'react';
import { ArrowIndicator } from './ArrowIndicator';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  previous?: number;
  current?: number;
  metricKey?: string;
  subtext?: string;
  className?: string;
  large?: boolean;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<Props> = ({
  label,
  value,
  unit,
  previous,
  current,
  metricKey,
  subtext,
  className = '',
  large = false,
  children,
}) => {
  const numVal = typeof current === 'number' ? current : typeof value === 'number' ? value : undefined;

  return (
    <div
      className={`card ${className}`}
      style={{ minHeight: large ? '110px' : '82px' }}
    >
      {/* Pixel art label — top-left in uppercase small pixel font */}
      <div
        className="label"
        style={{ marginBottom: '6px', letterSpacing: '0px' }}
      >
        {label}
      </div>

      {/* Value row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          marginTop: '4px',
          flexWrap: 'wrap',
        }}
      >
        <span className={`${large ? 'value' : 'value-sm'} glow`}>
          {value}
        </span>
        {unit && (
          <span className="unit">{unit}</span>
        )}
        {numVal !== undefined && (
          <ArrowIndicator current={numVal} previous={previous} metricKey={metricKey} />
        )}
      </div>

      {subtext && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-dim)',
          marginTop: '4px',
        }}>
          {subtext}
        </div>
      )}
      {children}
    </div>
  );
};
