import React from 'react';
import { t } from '../i18n';

interface PublicParticipant {
  display_name: string;
  hashrate: number;
  hashrate_unit: string;
}

interface CollectiveStatsData {
  total_participants: number;
  active_participants: number;
  total_hashrate: number;
  total_hashrate_unit: string;
  public_participants: PublicParticipant[];
  fetched_at: string;
}

interface Props {
  stats: CollectiveStatsData;
  loading?: boolean;
}

const StatBox: React.FC<{ label: string; value: string | number; unit?: string }> = ({
  label,
  value,
  unit,
}) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px 20px',
    textAlign: 'center',
    flex: 1,
    minWidth: '140px',
  }}>
    <div style={{
      fontSize: '11px',
      color: 'var(--text-dim)',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginBottom: '8px',
    }}>
      {label}
    </div>
    <div style={{
      fontFamily: 'var(--font-vt323)',
      fontSize: '32px',
      color: 'var(--primary)',
      textShadow: '0 0 10px var(--primary-glow)',
      lineHeight: 1,
    }}>
      {value}
      {unit && (
        <span style={{ fontSize: '16px', marginLeft: '4px', color: 'var(--text-dim)' }}>
          {unit}
        </span>
      )}
    </div>
  </div>
);

export const CollectiveStats: React.FC<Props> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        letterSpacing: '2px',
      }}>
        ◌ 통계 로딩 중...
      </div>
    );
  }

  const fetchedAt = stats.fetched_at
    ? new Date(stats.fetched_at).toLocaleTimeString('ko-KR')
    : '-';

  return (
    <div>
      {/* 주요 통계 */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <StatBox
          label={t('collective.stats.totalParticipants')}
          value={stats.total_participants}
          unit="명"
        />
        <StatBox
          label={t('collective.stats.activeParticipants')}
          value={stats.active_participants}
          unit="명"
        />
        <StatBox
          label={t('collective.stats.totalHashrate')}
          value={stats.total_hashrate.toFixed(2)}
          unit={stats.total_hashrate_unit}
        />
      </div>

      {/* 마지막 업데이트 */}
      <div style={{
        fontSize: '11px',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        marginBottom: '16px',
      }}>
        {t('collective.stats.lastUpdated')}: {fetchedAt}
      </div>

      {/* 공개 채굴자 목록 */}
      {stats.public_participants.length > 0 && (
        <div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--border)',
          }}>
            {t('collective.publicList.title')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stats.public_participants.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: i % 2 === 0 ? 'var(--bg-hover)' : 'transparent',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--text)' }}>
                  <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  {p.display_name}
                </span>
                <span style={{ color: 'var(--primary)', textShadow: '0 0 6px var(--primary-glow)' }}>
                  {p.hashrate.toFixed(2)} {p.hashrate_unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.public_participants.length === 0 && stats.total_participants > 0 && (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}>
          {t('collective.publicList.empty')}
        </div>
      )}
    </div>
  );
};
