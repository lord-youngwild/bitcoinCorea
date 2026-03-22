/**
 * Join.tsx — 조합원 등록 페이지
 *
 * 역할: 채굴조합 참가 신청의 유일한 진입점.
 * 지갑 주소 등록 = 조합원 가입.
 * 대시보드 config와 분리된 독립 플로우.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCollectiveStats } from '../api/client';
import { SeaOfCoreaPanel } from '../components/SeaOfCoreaPanel';

interface StatsData {
  total_participants: number;
  active_participants: number;
  total_hashrate: number;
  total_hashrate_unit: string;
  public_participants: Array<{ display_name: string; hashrate: number; hashrate_unit: string }>;
  fetched_at: string;
}

export const Join: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [justJoined, setJustJoined] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchCollectiveStats();
      setStats(data as StatsData);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRegistered = useCallback(() => {
    setJustJoined(true);
    loadStats();
  }, [loadStats]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto' }}>

      {/* 페이지 헤더 */}
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <h1 style={{
          fontSize: 'clamp(10px, 2.5vw, 14px)',
          letterSpacing: '2px',
          lineHeight: '2',
          marginBottom: '12px',
        }}>
          채굴조합 참가하기
        </h1>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-dim)',
          lineHeight: '1.8',
        }}>
          Ocean.xyz 채굴자라면 누구나 참가 가능합니다.<br />
          지갑 주소 등록 한 번으로 조합원이 됩니다.
        </div>
      </div>

      {/* 참가 성공 배너 */}
      {justJoined && (
        <div style={{
          background: 'rgba(0,255,136,0.06)',
          border: '4px solid var(--color-success)',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '4px 4px 0 0 rgba(0,0,0,0.5)',
          animation: 'stagger-in 0.3s ease-out both',
        }}>
          <div style={{
            fontFamily: 'var(--font-vt323)',
            fontSize: '32px',
            color: 'var(--color-success)',
            textShadow: '0 0 12px var(--color-success)',
            letterSpacing: '2px',
            marginBottom: '6px',
          }}>
            🌊 환영합니다!
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--color-success)',
            letterSpacing: '1px',
            lineHeight: '2',
          }}>
            Sea of Corea 탈중앙 채굴조합에 합류하셨습니다
          </div>
          {stats && (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              marginTop: '8px',
            }}>
              현재 {stats.active_participants}명 활성 채굴자 · 총{' '}
              {stats.total_hashrate.toFixed(2)} {stats.total_hashrate_unit}
            </div>
          )}
        </div>
      )}

      {/* 현황 요약 (상단 mini 카운터) */}
      {stats && !justJoined && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}>
          {[
            { label: 'MEMBERS', value: stats.total_participants },
            { label: 'ACTIVE', value: stats.active_participants },
            { label: 'HASHRATE', value: `${stats.total_hashrate.toFixed(1)} ${stats.total_hashrate_unit}` },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '12px' }}>
              <div className="label" style={{ marginBottom: '4px' }}>{label}</div>
              <div style={{
                fontFamily: 'var(--font-vt323)',
                fontSize: '24px',
                color: 'var(--primary)',
                textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 등록 / 탈퇴 / 확인 폼 — 기존 SeaOfCoreaPanel */}
      <SeaOfCoreaPanel onRegistered={handleRegistered} />

      {/* 뒤로가기 */}
      <div style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="btn" style={{ fontSize: '8px', padding: '8px 16px' }}>
            ◀ 홈으로
          </button>
        </Link>
      </div>
    </div>
  );
};
