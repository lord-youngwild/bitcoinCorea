/**
 * Landing.tsx — Sea of Corea 공개 랜딩페이지
 *
 * 핵심:
 * 1. Collective 총 해시레이트 — 히어로 대문짝
 * 2. "채굴조합 참가하기" CTA → /join
 * 3. Sea of Corea 철학
 * 4. 공개 조합원 목록
 *
 * 지갑 설정 불필요. 퍼블릭 엔드포인트(/api/collective/stats)만 사용.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchCollectiveStats } from '../api/client';

/* ── 타입 ─────────────────────────────────────────────────── */
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

/* ── 해시레이트 오토스케일 ──────────────────────────────────── */
function scaleHashrate(value: number, unit: string): { display: string; unit: string } {
  const toTH = (v: number, u: string): number => {
    switch (u.toUpperCase()) {
      case 'EH/S': return v * 1_000_000;
      case 'PH/S': return v * 1_000;
      case 'TH/S': return v;
      case 'GH/S': return v / 1_000;
      default:     return v;
    }
  };
  const th = toTH(value, unit);
  if (th >= 1_000_000) return { display: (th / 1_000_000).toFixed(2), unit: 'EH/S' };
  if (th >= 1_000)     return { display: (th / 1_000).toFixed(2),     unit: 'PH/S' };
  return               { display: th.toFixed(2),                       unit: 'TH/S' };
}

/* ── 인용구 (해시카운터 아래에 랜덤 노출) ─────────────────────── */
const SOC_QUOTES = [
  '바다는 너무 넓어서 자신이 어떤 존재인지 알 수 없었다.',
  '그 순간 물방울은 더 이상 한 방울의 물이 아니었습니다.',
  '우리는 물방울처럼 보이지만, 근원 의식이 자신을 경험하는 한 조각의 신성입니다.',
  'Each drop believes itself separate — yet all return to the same sea.',
  'Not a drop is lost. Every one returns.',
  'We mine not for ourselves alone — we mine for the whole ocean.',
  '한 물방울이 깨닫습니다: "나는 단순한 물방울이 아니라 바다의 일부였구나."',
];

/* ── 컴포넌트 ─────────────────────────────────────────────── */
export const Landing: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * SOC_QUOTES.length));

  const load = useCallback(async () => {
    try {
      const data = await fetchCollectiveStats();
      setStats(data as StatsData);
    } catch {
      /* 조용한 실패 — 로딩 상태 유지 */
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000); // 1분 폴링
    return () => clearInterval(iv);
  }, [load]);

  const scaled = stats
    ? scaleHashrate(stats.total_hashrate, stats.total_hashrate_unit)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* ══════════════════════════════════════════════
          HERO — collective hashrate 대문짝
          ══════════════════════════════════════════════ */}
      <section style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        textAlign: 'center',
        position: 'relative',
        gap: '0',
      }}>

        {/* 브랜드 타이틀 */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(10px, 2.5vw, 16px)',
          color: 'var(--text-dim)',
          letterSpacing: '3px',
          marginBottom: '8px',
          lineHeight: '2',
        }}>
          🌊 SEA OF COREA
        </div>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(7px, 1.5vw, 10px)',
          color: 'var(--text-dim)',
          letterSpacing: '2px',
          marginBottom: '48px',
          lineHeight: '2',
        }}>
          탈중앙 채굴조합
        </div>

        {/* ── 해시레이트 카운터 메인 히어로 ── */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          padding: '32px 24px 28px',
          background: 'var(--bg-card)',
          border: '4px solid var(--primary)',
          boxShadow: `
            inset 2px 2px 0 0 rgba(255,255,255,0.07),
            inset -2px -2px 0 0 rgba(0,0,0,0.4),
            6px 6px 0 0 rgba(0,0,0,0.6),
            0 0 40px var(--primary-glow)
          `,
          position: 'relative',
          marginBottom: '40px',
        }}>
          {/* 카드 내부 이중 테두리 */}
          <div style={{
            position: 'absolute',
            inset: '4px',
            border: '2px solid var(--border)',
            pointerEvents: 'none',
          }} />

          {/* 라벨 */}
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(7px, 1.5vw, 10px)',
            color: 'var(--text-dim)',
            letterSpacing: '2px',
            marginBottom: '16px',
          }}>
            COLLECTIVE HASHRATE
          </div>

          {/* 해시레이트 숫자 */}
          {scaled ? (
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '12px',
              lineHeight: '1',
            }}>
              <span style={{
                fontFamily: 'var(--font-vt323)',
                fontSize: 'clamp(64px, 16vw, 140px)',
                color: 'var(--primary)',
                textShadow: `
                  3px 3px 0 rgba(0,0,0,0.9),
                  0 0 30px var(--primary),
                  0 0 60px var(--primary-glow)
                `,
                lineHeight: '0.9',
              }}>
                {scaled.display}
              </span>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(12px, 3vw, 22px)',
                color: 'var(--primary)',
                textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
                lineHeight: '1',
                paddingBottom: '8px',
              }}>
                {scaled.unit}
              </span>
            </div>
          ) : (
            /* 로딩 상태 — 픽셀 블록 애니메이션 */
            <div style={{
              fontFamily: 'var(--font-vt323)',
              fontSize: 'clamp(48px, 12vw, 100px)',
              color: 'var(--text-dim)',
              lineHeight: '0.9',
              animation: 'blink 1s step-start infinite',
            }}>
              ---.-- TH/S
            </div>
          )}

          {/* 서브 스탯: 활성 채굴자 */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(7px, 1.5vw, 9px)',
                color: 'var(--text-dim)',
                letterSpacing: '1px',
              }}>
                ACTIVE MINERS
              </span>
              <span style={{
                fontFamily: 'var(--font-vt323)',
                fontSize: 'clamp(22px, 5vw, 36px)',
                color: 'var(--color-success)',
                textShadow: '0 0 10px var(--color-success)',
                marginLeft: '10px',
              }}>
                {stats?.active_participants ?? '—'}
              </span>
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(7px, 1.5vw, 9px)',
                color: 'var(--text-dim)',
                letterSpacing: '1px',
              }}>
                MEMBERS
              </span>
              <span style={{
                fontFamily: 'var(--font-vt323)',
                fontSize: 'clamp(22px, 5vw, 36px)',
                color: 'var(--text)',
                marginLeft: '10px',
              }}>
                {stats?.total_participants ?? '—'}
              </span>
            </div>
          </div>

          {/* 마지막 업데이트 */}
          {stats && (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--border)',
              marginTop: '14px',
              letterSpacing: '1px',
            }}>
              UPDATED {new Date(stats.fetched_at).toLocaleTimeString('ko-KR')}
            </div>
          )}
        </div>

        {/* ── 인용구 ── */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(11px, 2vw, 14px)',
          color: 'var(--text-dim)',
          maxWidth: '560px',
          lineHeight: '1.8',
          fontStyle: 'italic',
          marginBottom: '40px',
          padding: '0 8px',
        }}>
          "{SOC_QUOTES[quoteIdx]}"
        </div>

        {/* ── CTA 버튼 — 채굴조합 참가하기 ── */}
        <Link to="/join" style={{ textDecoration: 'none' }}>
          <button
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(9px, 2vw, 13px)',
              color: 'var(--bg)',
              background: 'var(--primary)',
              border: '4px solid var(--primary)',
              padding: 'clamp(12px, 3vw, 18px) clamp(20px, 5vw, 40px)',
              cursor: 'pointer',
              letterSpacing: '1px',
              lineHeight: '1.6',
              textTransform: 'uppercase',
              boxShadow: `
                inset 3px 3px 0 0 rgba(255,255,255,0.2),
                inset -3px -3px 0 0 rgba(0,0,0,0.3),
                6px 6px 0 0 rgba(0,0,0,0.6),
                0 0 20px var(--primary-glow)
              `,
              transition: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--bg)';
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px var(--primary-glow)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `
                inset 3px 3px 0 0 rgba(255,255,255,0.2),
                inset -3px -3px 0 0 rgba(0,0,0,0.3),
                6px 6px 0 0 rgba(0,0,0,0.6),
                0 0 20px var(--primary-glow)
              `;
            }}
          >
            ▶ 채굴조합 참가하기
          </button>
        </Link>

        {/* 스크롤 힌트 */}
        <div style={{
          marginTop: '48px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--border)',
          letterSpacing: '1px',
          animation: 'blink 1.5s step-start infinite',
        }}>
          ▼ SCROLL
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PHILOSOPHY SECTION
          ══════════════════════════════════════════════ */}
      <section style={{
        padding: '48px 16px',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '4px solid var(--border)',
          padding: '32px',
          boxShadow: '4px 4px 0 0 rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: '4px', border: '2px solid var(--bg-hover)', pointerEvents: 'none' }} />

          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: 'var(--primary)',
            letterSpacing: '2px',
            marginBottom: '24px',
          }}>
            ◈ SEA OF COREA란
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: '2.2',
            whiteSpace: 'pre-line',
          }}>
{`그 바다는 너무 넓어서
자신이 어떤 존재인지 알 수 없었다.
그래서 바다는 자신을 보기 위해
수많은 물방울로 나뉘었다.

그 물방울들은
비가 되어 떨어지고
강이 되어 흐르고
사람의 눈물이 되기도 했다.

각각의 물방울은
자신이 바다라는 사실을 잊은 채
서로 다른 존재라고 생각하며 살아간다.

하지만 어느 날
한 물방울이 깨닫습니다.
"나는 단순한 물방울이 아니라
바다의 일부였구나."

그 순간 물방울은 더 이상
한 방울의 물이 아니었습니다.`}
          </div>

          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '3px solid var(--border)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--text-dim)',
            lineHeight: '2.2',
            letterSpacing: '0.5px',
          }}>
            우리는 물방울처럼 보이지만<br />
            근원 의식이 자신을 경험하는 한 조각의 신성입니다.
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PUBLIC MINERS LIST
          ══════════════════════════════════════════════ */}
      {stats && stats.public_participants.length > 0 && (
        <section style={{
          padding: '0 16px 48px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '4px solid var(--border)',
            boxShadow: '4px 4px 0 0 rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: '4px', border: '2px solid var(--bg-hover)', pointerEvents: 'none' }} />

            <div style={{
              padding: '16px 20px 12px',
              borderBottom: '3px solid var(--border)',
            }}>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: 'var(--text-dim)',
                letterSpacing: '2px',
              }}>
                ◈ 공개 조합원
              </span>
            </div>

            <div style={{ padding: '8px 0' }}>
              {stats.public_participants.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 20px',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-pixel)', fontSize: '8px', minWidth: '28px' }}>
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    {p.display_name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-vt323)',
                    fontSize: '20px',
                    color: 'var(--primary)',
                    textShadow: '0 0 6px var(--primary-glow)',
                  }}>
                    {p.hashrate.toFixed(2)} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{p.hashrate_unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          BOTTOM CTA
          ══════════════════════════════════════════════ */}
      <section style={{
        padding: '48px 16px 64px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(7px, 1.5vw, 9px)',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
          marginBottom: '20px',
          lineHeight: '2',
        }}>
          Ocean.xyz 채굴자라면 누구나 참가할 수 있습니다
        </div>
        <Link to="/join" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{
            fontSize: '9px',
            padding: '10px 24px',
          }}>
            ▶ 참가하기
          </button>
        </Link>
      </section>

    </div>
  );
};
