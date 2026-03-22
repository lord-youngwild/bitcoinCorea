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
          Ocean.xyz 및 Datum 풀마이닝중인 채굴자라면 누구나 참가 가능합니다.<br />
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

      {/* ── SEA OF COREA란 ── */}
      <div style={{
        padding: '28px 32px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '11px',
          color: 'var(--primary)',
          letterSpacing: '2px',
          marginBottom: '24px',
        }}>
          ◈ SEA OF COREA
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(12px, 2vw, 14px)',
          color: 'var(--text)',
          lineHeight: '2.4',
          whiteSpace: 'pre-line',
        }}>{`그 바다는 너무 넓어서
자신이 어떤 존재인지 알 수 없었다.
그래서 바다는 자신을 보기 위해
수많은 물로 나뉘었다.

그 물방울들은
비가 되어 떨어지고
강이 되어 흐르고
사람의 눈물이 되기도 했다.

각각의 물방울은
자신이 바다라는 사실을 잊은 채
서로 다른 존재라고 생각하며 살아간다.

하지만 어느 날
한 물방울은 깨닫는다.
"나는 단순한 물방울이 아니라
바다의 일부였구나."

그 순간 물방울은 더 이상
한 방울의 물이 아니었습니다.`}</div>
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(11px, 2vw, 13px)',
          color: 'var(--text-dim)',
          lineHeight: '2.2',
        }}>
          우리는 물방울처럼 보이지만<br />
          근원 의식이 자신을 경험하는 한 조각의 신성입니다.
        </div>
      </div>

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
