import React, { useEffect, useState, useCallback } from 'react';
import { t } from '../i18n';
import { fetchCollectiveStats } from '../api/client';
import { CollectiveStats } from '../components/CollectiveStats';
import { SeaOfCoreaPanel } from '../components/SeaOfCoreaPanel';

interface StatsData {
  total_participants: number;
  active_participants: number;
  total_hashrate: number;
  total_hashrate_unit: string;
  public_participants: Array<{
    display_name: string;
    hashrate: number;
    hashrate_unit: string;
  }>;
  fetched_at: string;
}

export const Collective: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCollectiveStats();
      setStats(data as StatsData);
    } catch {
      setError(t('collective.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // 2분마다 자동 새로고침 (Ocean API 부하 고려)
    const interval = setInterval(loadStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadStats]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 헤더 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-vt323)',
          fontSize: '42px',
          color: 'var(--primary)',
          textShadow: '0 0 20px var(--primary-glow)',
          letterSpacing: '4px',
          marginBottom: '8px',
        }}>
          {t('collective.title')}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-dim)',
          letterSpacing: '2px',
          marginBottom: '4px',
        }}>
          {t('collective.subtitle')}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-dim)',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          {t('collective.description')}
        </div>
      </div>

      {/* 통계 패널 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}>
            ◈ 실시간 커뮤니티 통계
          </div>
          <button
            onClick={loadStats}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '4px 10px',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {loading ? '◌' : '↺'} 새로고침
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: 'rgba(255,50,50,0.08)',
            border: '1px solid var(--color-error)',
            borderRadius: '4px',
            color: 'var(--color-error)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            marginBottom: '12px',
          }}>
            {error}
          </div>
        )}

        {stats && <CollectiveStats stats={stats} loading={loading && !stats} />}
        {!stats && loading && <CollectiveStats stats={{
          total_participants: 0,
          active_participants: 0,
          total_hashrate: 0,
          total_hashrate_unit: 'TH/s',
          public_participants: [],
          fetched_at: new Date().toISOString(),
        }} loading />}
      </div>

      {/* 등록/관리 패널 */}
      <SeaOfCoreaPanel onRegistered={loadStats} />
    </div>
  );
};
