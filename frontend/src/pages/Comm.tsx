/**
 * Comm.tsx — Bitcoin Community Links
 */

import React from 'react';

interface CommLink {
  label: string;
  url: string;
  desc: string;
  tags: string[];
}

const COMM_LINKS: CommLink[] = [
  {
    label: 'BITCOIN⚡️CITADEL',
    url: 'https://discord.com/invite/citadel21',
    desc: '대한민국 비트코인 온리 커뮤니티',
    tags: ['COMMUNITY'],
  },
  {
    label: 'BTC Store',
    url: 'https://store.btcmap.kr/',
    desc: '비트코인 온라인 스토어',
    tags: ['STORE'],
  },
  {
    label: 'CORN🌽WALLET',
    url: 'https://team.oksu.su/ko',
    desc: '로컬 라이트닝 월렛',
    tags: ['LIGHTNING'],
  },
  {
    label: 'COCONUT',
    url: 'https://www.coconut.onl/',
    desc: '비트코인 셀프커스터디',
    tags: ['CUSTODY'],
  },
  {
    label: 'BITCOIN☕️CAFE',
    url: 'https://promenadecastle.com',
    desc: '비트코인 캐슬 프로메나드',
    tags: ['CASTLE'],
  },
];

const TAG_COLORS: Record<string, string> = {
  FORUM:     'rgba(32,178,170,0.8)',
  REDDIT:    'rgba(255,87,0,0.8)',
  NEWS:      'rgba(255,200,71,0.8)',
  MEDIA:     'rgba(180,120,255,0.8)',
  RESEARCH:  'rgba(0,180,255,0.8)',
  MINING:    'rgba(255,157,42,0.9)',
  TOOL:      'rgba(100,220,100,0.8)',
  DEV:       'rgba(255,100,150,0.8)',
  LEARN:     'rgba(32,178,170,0.6)',
  COMMUNITY: 'rgba(88,101,242,0.9)',
  STORE:     'rgba(255,200,71,0.9)',
  LIGHTNING: 'rgba(255,230,0,0.95)',
  CUSTODY:   'rgba(255,157,42,0.8)',
  CASTLE: 'rgba(255,180,60,0.9)',
};

export const Comm: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8px 0 48px' }}>

      {/* 헤더 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(12px, 2vw, 16px)',
          color: 'var(--primary)',
          letterSpacing: '4px',
          marginBottom: '8px',
          textShadow: '0 0 12px var(--primary-glow)',
        }}>
          ◈ COMMUNITY
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
        }}>
          비트코인 커뮤니티 & 리소스 링크 모음
        </div>
      </div>

      {/* 링크 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {COMM_LINKS.length === 0 && (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--text-dim)',
            letterSpacing: '2px',
            border: '1px dashed var(--border)',
          }}>
            COMING SOON
          </div>
        )}
        {COMM_LINKS.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)';
            }}
            >
              {/* 태그 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '64px', alignItems: 'flex-end', flexShrink: 0 }}>
                {link.tags.map((tag) => (
                  <span key={tag} style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    color: TAG_COLORS[tag] ?? 'var(--text-dim)',
                    letterSpacing: '1px',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* 구분선 */}
              <div style={{ width: '1px', height: '32px', background: 'var(--border)', flexShrink: 0 }} />

              {/* 내용 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '15px',
                  color: 'var(--primary)',
                  marginBottom: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {link.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  lineHeight: '1.5',
                }}>
                  {link.desc}
                </div>
              </div>

              {/* 화살표 */}
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                color: 'var(--text-dim)',
                flexShrink: 0,
              }}>
                ▶
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
