/**
 * Landing.tsx — Sea of Corea 공개 랜딩페이지
 *
 * 디자인: 우주정거장 콕핏에서 바다를 내려다보는 뷰
 * 배경: space-ocean.png
 * 폰트: Press Start 2P (라벨), Share Tech Mono (한글/데이터), VT323 (숫자)
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
    wallet?: string;
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

/* ── 인용구 ─────────────────────────────────────────────────── */
const SOC_QUOTES = [
  '바다는 너무 넓어서 자신이 어떤 존재인지 알 수 없었다.',
  '그 순간 물방울은 더 이상 한 방울의 물이 아니었다.',
  '우리는 물방울처럼 보이지만, 근원 의식이 자신을 경험하는 한 조각의 신성입니다.',
  'Each drop believes itself separate — yet all return to the same sea.',
  'Not a drop is lost. Every one returns.',
  'We mine not for ourselves alone — we mine for the whole ocean.',
  '한 물방울은 깨닫는다: "나는 단순한 물방울이 아니라 바다의 일부였구나."',
];

/* ── SF 색상 팔레트 ────────────────────────────────────────── */
const C = {
  void:      '#04060f',
  deep:      '#090e20',
  glowBlue:  '#93E9BE',
  glowCyan:  '#93E9BE',
  glowAmber: '#ff9d2a',
  glowGold:  '#ffc847',
  textHi:    '#9adcd8',
  textMd:    '#2e7a76',
  textLo:    '#154a48',
  panelBg:   'rgba(9,14,32,0.65)',
};



/* ── 컴포넌트 ─────────────────────────────────────────────── */
export const Landing: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * SOC_QUOTES.length));

  const load = useCallback(async () => {
    try {
      const data = await fetchCollectiveStats();
      setStats(data as StatsData);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, [load]);

  const scaled = stats ? scaleHashrate(stats.total_hashrate, stats.total_hashrate_unit) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* ── 애니메이션 키프레임 ── */}
      <style>{`
        @keyframes scanBeam {
          0%   { transform: translateX(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(400%); opacity: 0; }
        }
        @keyframes logoDrift {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes ledPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .soc-below-hero {
          position: relative;
          background: var(--bg);
        }
        .soc-cta-btn {
          position: relative;
          font-family: var(--font-pixel);
          font-size: clamp(13px, 1.8vw, 16px);
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${C.glowAmber};
          background: rgba(255,157,42,0.06);
          border: 1.5px solid rgba(255,157,42,0.45);
          padding: clamp(14px, 3vw, 20px) clamp(32px, 6vw, 56px);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          line-height: 1.8;
        }
        .soc-cta-btn:hover {
          background: rgba(255,157,42,0.12);
          border-color: rgba(255,157,42,0.8);
          box-shadow:
            0 0 24px rgba(255,157,42,0.45),
            0 0 60px rgba(255,157,42,0.18),
            inset 0 0 20px rgba(255,157,42,0.06);
          color: #ffc878;
        }
        .soc-cta-btn:active {
          background: rgba(255,157,42,0.18);
        }
        .soc-panel {
          position: relative;
          background: ${C.panelBg};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,212,255,0.15);
          overflow: hidden;
        }
        .soc-scan-beam {
          position: absolute;
          top: 0; bottom: 0;
          width: 25%;
          background: linear-gradient(to right, transparent, rgba(0,212,255,0.06), transparent);
          animation: scanBeam 4s ease-in-out infinite;
          pointer-events: none;
        }
        @media (max-width: 640px) {
          .soc-cta-btn { font-size: 15px; padding: 14px 28px; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          HERO — space-ocean 배경
          ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeUp 0.8s ease-out both',
      }}>
        <img
          src="/space-ocean.png"
          alt=""
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1,
          background: 'radial-gradient(ellipse at 50% 40%, transparent 22%, rgba(6,10,18,0.4) 50%, rgba(6,10,18,0.88) 100%)',
          pointerEvents: 'none',
        }} />

        {/* 콘텐츠 */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 60px', textAlign: 'center' }}>
        <div style={{ width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>

          {/* 로고 */}
          <img
            src="/soc-logo.png"
            alt="Sea of Corea"
            style={{
              width: 'clamp(64px, 10vw, 88px)',
              height: 'auto',
              marginBottom: '20px',
              filter: 'drop-shadow(0 0 10px rgba(255,157,42,0.3))',
              animation: 'logoDrift 4s ease-in-out infinite',
            }}
          />

          {/* 브랜드 타이틀 */}
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(13px, 3vw, 20px)',
            color: C.textHi,
            letterSpacing: '6px',
            marginBottom: '6px',
          }}>
            SEA OF COREA
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(13px, 2.2vw, 17px)',
            color: C.textMd,
            letterSpacing: '4px',
            marginBottom: '40px',
          }}>
            탈중앙 채굴조합
          </div>

          {/* ── 해시레이트 패널 ── */}
          <div className="soc-panel" style={{
            width: '100%',
            padding: '28px 28px 24px',
            marginBottom: '32px',
          }}>
            <div className="soc-scan-beam" />

            {/* 라벨 */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
  
              fontSize: 'clamp(9px, 1.5vw, 11px)',
              color: C.textMd,
              letterSpacing: '3px',
              marginBottom: '14px',
            }}>
              ◈ COLLECTIVE HASHRATE
            </div>

            {/* 숫자 */}
            {scaled ? (
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:'10px', lineHeight:'1' }}>
                <span style={{
                  fontFamily: 'var(--font-vt323)',
                  fontSize: 'clamp(60px, 15vw, 130px)',
                  color: C.glowGold,
                  textShadow: `0 0 24px rgba(255,200,71,0.55), 0 0 60px rgba(255,200,71,0.2)`,
                  lineHeight: '0.9',
                }}>
                  {scaled.display}
                </span>
                <span style={{
                  fontFamily: 'var(--font-pixel)',
      
                  fontSize: 'clamp(14px, 3vw, 22px)',
                  color: C.textMd,
                  letterSpacing: '1px',
                  paddingBottom: '8px',
                }}>
                  {scaled.unit}
                </span>
              </div>
            ) : (
              <div style={{
                fontFamily: 'var(--font-vt323)',
                fontSize: 'clamp(48px, 12vw, 100px)',
                color: C.textLo,
                lineHeight: '0.9',
                animation: 'blink 1s step-start infinite',
              }}>
                ---.-- TH/S
              </div>
            )}

            {/* 서브 스탯 */}
            <div style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1px 1fr',
              gap: '0',
              maxWidth: '400px',
              margin: '20px auto 0',
            }}>
              <div style={{ textAlign:'center', padding:'8px 0' }}>
                <div style={{ fontFamily:'var(--font-pixel)', fontSize:'clamp(7px,1.4vw,9px)', color:C.textMd, letterSpacing:'2px', marginBottom:'4px' }}>ACTIVE MINERS</div>
                <div style={{ fontFamily:'var(--font-vt323)', fontSize:'clamp(22px,5vw,34px)', color:C.glowCyan, textShadow:`0 0 10px rgba(0,212,255,0.5)` }}>
                  {stats?.active_participants ?? '—'}
                </div>
              </div>
              <div style={{ background:`linear-gradient(to bottom, transparent, rgba(0,212,255,0.2), transparent)`, width:'1px' }} />
              <div style={{ textAlign:'center', padding:'8px 0' }}>
                <div style={{ fontFamily:'var(--font-pixel)', fontSize:'clamp(7px,1.4vw,9px)', color:C.textMd, letterSpacing:'2px', marginBottom:'4px' }}>MEMBERS</div>
                <div style={{ fontFamily:'var(--font-vt323)', fontSize:'clamp(22px,5vw,34px)', color:C.textMd }}>
                  {stats?.total_participants ?? '—'}
                </div>
              </div>
            </div>

            {/* 업데이트 시각 */}
            {stats && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: C.textMd,
                marginTop: '16px',
                letterSpacing: '1px',
              }}>
                UPDATED {new Date(stats.fetched_at).toLocaleTimeString('ko-KR')}
              </div>
            )}
          </div>

        </div>
        </div>

        {/* 스크롤 힌트 — 히어로 하단 고정 */}
        <div style={{
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: C.textLo,
          letterSpacing: '2px',
          animation: 'blink 1.5s step-start infinite',
          zIndex: 1,
        }}>
          ▼ SCROLL
        </div>
      </section>


      <div className="soc-below-hero">

      {/* 여백 */}
      <div style={{ height: '40px' }} />

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
          <div className="soc-panel" style={{ overflow: 'hidden' }}>
            <div className="soc-scan-beam" />
  
            <div style={{
              padding: '16px 24px 12px',
              borderBottom: `1px solid rgba(0,212,255,0.12)`,
            }}>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontWeight: 400,
                fontSize: '19px',
                color: C.glowCyan,
                letterSpacing: '3px',
              }}>
                ◈ 조합원명부
              </span>
            </div>

            <div style={{ padding: '8px 0' }}>
              {stats.public_participants.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 24px',
                  background: i % 2 === 0 ? 'rgba(0,212,255,0.02)' : 'transparent',
                  borderBottom: `1px solid rgba(0,212,255,0.04)`,
                  flexWrap: 'wrap',
                  gap: '4px',
                }}>
                  <span style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:C.textLo, minWidth:'24px' }}>
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'14px', color:C.textHi }}>
                        {p.display_name}
                      </span>
                      {p.wallet && (
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:C.textLo, letterSpacing:'0.5px' }}>
                          {p.wallet}
                        </span>
                      )}
                    </span>
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'16px', color:C.glowCyan, textShadow:`0 0 6px rgba(0,212,255,0.4)` }}>
                    {p.hashrate.toFixed(2)}{' '}
                    <span style={{ fontSize:'11px', color:C.textLo }}>{p.hashrate_unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          단체소개 + 인용구
          ══════════════════════════════════════════════ */}
      <section style={{
        padding: '0 16px 24px',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '100%',
          padding: '20px 24px',
          background: 'rgba(255,157,42,0.04)',
          border: '1px solid rgba(255,157,42,0.4)',
          textAlign: 'left',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(13px, 2vw, 15px)',
            color: C.textHi,
            lineHeight: '2',
            whiteSpace: 'pre-line',
          }}>{`Sea of Corea는 비트코인 탈중앙 채굴조합입니다.
우리는 로컬 해시레이트를 모아 바다를 이루고
각자의 파도로 춤추듯 일렁이며
누구의 허락도 필요없는 자유를 항해합니다.
소버린 채굴을 실천하여 탈중앙화 주권은 개인으로,
비트코인 네트워크의 힘은 우리의 바다 깊숙이 가라앉습니다.
참여는 자발적이며, 존재는 주권적으로, 채굴은 자연적으로 흘러갑니다.`}</div>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(12px, 2vw, 14px)',
          color: C.textMd,
          maxWidth: '560px',
          lineHeight: '2',
          fontStyle: 'italic',
          padding: '0 8px',
          textAlign: 'center',
        }}>
          "{SOC_QUOTES[quoteIdx]}"
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
          ══════════════════════════════════════════════ */}
      <section style={{ padding: '16px 16px 48px', textAlign: 'center' }}>
        <Link to="/join" style={{ textDecoration: 'none' }}>
          <button className="soc-cta-btn">
            ▶ 채굴조합 참가하기
          </button>
        </Link>
      </section>

      {/* ══════════════════════════════════════════════
          BOTTOM CTA
          ══════════════════════════════════════════════ */}
      <section style={{
        padding: '48px 16px 72px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 200,
          fontSize: 'clamp(12px, 2vw, 14px)',
          color: C.textMd,
          letterSpacing: '1px',
          marginBottom: '24px',
          lineHeight: '2',
        }}>
          Ocean.xyz 및 Datum 풀마이닝중인 채굴자라면 누구나 참가 가능합니다
        </div>
        <a href="https://ocean.xyz/docs" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button className="soc-cta-btn">
            ▶ 오션풀 알아보기
          </button>
        </a>
      </section>

      </div>
    </div>
  );
};
