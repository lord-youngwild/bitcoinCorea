import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ── Types ──────────────────────────────────────────────────────────────────────

interface RewardStats {
  blocks: number;
  total_reward_btc: number;
  avg_block_fee_btc: number;
  avg_tx_fee_sat: number;
  total_tx: number;
}

interface DifficultyAdjustment {
  progress_pct: number;
  remaining_blocks: number;
  difficulty_change_pct: number;
  estimated_retarget_ms: number;
  next_retarget_height: number;
  previous_retarget_pct: number;
  time_avg_minutes: number;
}

interface Halving {
  current_height: number;
  next_halving_height: number;
  blocks_remaining: number;
  estimated_ts: number;
}

interface Pool {
  rank: number;
  name: string;
  blockCount: number;
  slug: string;
}

interface MiningPools {
  period: string;
  pool_count: number;
  pools: Pool[];
}

interface HashratePoint {
  timestamp: number;
  hashrate_eh: number;
}

interface DifficultyPoint {
  timestamp: number;
  difficulty: number;
}

interface Hashrate {
  current_eh: number;
  current_difficulty: number;
  chart: HashratePoint[];
  difficulty_chart: DifficultyPoint[];
}

interface RecentBlock {
  height: number;
  hash: string;
  tx_count: number;
  size_kb: number;
  pool: string;
  reward_btc: number;
  fees_btc: number;
  timestamp: number;
}

interface NetworkStats {
  reward_stats: RewardStats;
  difficulty_adjustment: DifficultyAdjustment;
  halving: Halving;
  mining_pools: MiningPools;
  hashrate: Hashrate;
  recent_blocks: RecentBlock[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(ts: number, ms = false): string {
  const d = new Date(ms ? ts : ts * 1000);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDateFull(ts: number, ms = false): string {
  const d = new Date(ms ? ts : ts * 1000);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function diffColor(pct: number): string {
  if (pct > 0) return 'var(--color-error)';
  if (pct < 0) return 'var(--color-success)';
  return 'var(--text-dim)';
}

function timeAgo(ts: number): string {
  const delta = Math.floor(Date.now() / 1000) - ts;
  if (delta < 60) return `${delta}s 전`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m 전`;
  const h = Math.floor(delta / 3600);
  const m = Math.floor((delta % 3600) / 60);
  return m ? `${h}h ${m}m 전` : `${h}h 전`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const Card: React.FC<{ title: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    padding: '16px',
    boxShadow: '4px 4px 0 0 rgba(0,0,0,0.5)',
    ...style,
  }}>
    <div style={{
      fontFamily: 'var(--font-pixel)',
      fontSize: '11px',
      color: 'var(--primary)',
      letterSpacing: '1px',
      marginBottom: '12px',
      textShadow: '0 0 6px var(--primary-glow)',
      borderBottom: '1px solid var(--border)',
      paddingBottom: '8px',
    }}>
      {title}
    </div>
    {children}
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '3px' }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: color || 'var(--text)', fontWeight: 'bold', lineHeight: 1.2 }}>
      {value}
    </div>
    {sub && <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)', marginTop: '3px' }}>{sub}</div>}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

export const Network: React.FC = () => {
  const [data, setData] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/network/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--font-pixel)', color: 'var(--primary)', fontSize: '10px', letterSpacing: '2px' }}>
        LOADING NETWORK DATA...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--font-pixel)', color: 'var(--color-error)', fontSize: '10px', letterSpacing: '2px' }}>
        ERROR: {error || '알 수 없는 오류'}
        <br /><br />
        <button onClick={fetchData} style={{
          background: 'var(--bg-card)', border: '2px solid var(--primary)', color: 'var(--primary)',
          fontFamily: 'var(--font-pixel)', fontSize: '9px', padding: '6px 12px', cursor: 'pointer',
        }}>RETRY</button>
      </div>
    );
  }

  const { reward_stats, difficulty_adjustment, halving, mining_pools, hashrate, recent_blocks } = data;

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartLabels = hashrate.chart.map((h) => formatDate(h.timestamp));
  const hashrateDataset = hashrate.chart.map((h) => h.hashrate_eh);
  const difficultyDataset = hashrate.difficulty_chart.map((d) => d.difficulty / 1e12); // T

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '해시레이트 (EH/s)',
        data: hashrateDataset,
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(255,157,42,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: '난이도 (T)',
        data: difficultyDataset,
        borderColor: 'var(--color-success)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
        borderDash: [4, 4],
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-dim)',
          font: { family: 'var(--font-pixel)', size: 11 },
          boxWidth: 14,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        borderWidth: 1,
        titleColor: 'var(--primary)',
        bodyColor: 'var(--text)',
        titleFont: { family: 'var(--font-pixel)', size: 11 },
        bodyFont: { family: 'var(--font-mono)', size: 12 },
      },
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-dim)', font: { family: 'var(--font-pixel)', size: 10 }, maxTicksLimit: 7 },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        position: 'left' as const,
        ticks: { color: 'var(--primary)', font: { family: 'var(--font-mono)', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        title: { display: true, text: 'EH/s', color: 'var(--primary)', font: { family: 'var(--font-pixel)', size: 10 } },
      },
      y1: {
        position: 'right' as const,
        ticks: { color: 'var(--color-success)', font: { family: 'var(--font-mono)', size: 11 } },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'T', color: 'var(--color-success)', font: { family: 'var(--font-pixel)', size: 10 } },
      },
    },
  };

  // Pool bar max
  const maxBlocks = mining_pools.pools[0]?.blockCount || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* ── 헤더 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px', color: 'var(--primary)', letterSpacing: '2px', textShadow: '0 0 10px var(--primary-glow)' }}>
          ▶ BITCOIN NETWORK
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {lastUpdated && (
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>
              UPD {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button onClick={fetchData} style={{
            background: 'var(--bg-card)', border: '2px solid var(--border)', color: 'var(--text-dim)',
            fontFamily: 'var(--font-pixel)', fontSize: '10px', padding: '5px 10px', cursor: 'pointer',
          }}>⟳ 갱신</button>
        </div>
      </div>

      {/* ── Row 1: 보상 + 난이도 + 반감기 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>

        {/* 보상 관련 데이터 */}
        <Card title={`◈ 보상 데이터 (최근 ${reward_stats.blocks}블록)`}>
          <Stat
            label="채굴 보상 합계"
            value={`${reward_stats.total_reward_btc.toFixed(4)} BTC`}
          />
          <Stat
            label="평균 블록 수수료"
            value={`${reward_stats.avg_block_fee_btc.toFixed(5)} BTC`}
          />
          <Stat
            label="평균 거래 수수료"
            value={`${reward_stats.avg_tx_fee_sat.toFixed(1)} sat`}
          />
          <Stat
            label="총 거래 건수"
            value={reward_stats.total_tx.toLocaleString()}
          />
        </Card>

        {/* 난이도 조정 */}
        <Card title="◈ 난이도 조정">
          {/* 진행 바 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>진행률</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--primary)' }}>{difficulty_adjustment.progress_pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ height: '100%', width: `${difficulty_adjustment.progress_pct}%`, background: 'var(--primary)', boxShadow: '0 0 4px var(--primary-glow)' }} />
            </div>
          </div>
          <Stat
            label="남은 블록"
            value={difficulty_adjustment.remaining_blocks.toLocaleString()}
            sub={`다음 재조정: 블록 #${difficulty_adjustment.next_retarget_height.toLocaleString()}`}
          />
          <Stat
            label="예상 변동폭"
            value={`${difficulty_adjustment.difficulty_change_pct > 0 ? '+' : ''}${difficulty_adjustment.difficulty_change_pct.toFixed(2)}%`}
            color={diffColor(difficulty_adjustment.difficulty_change_pct)}
            sub={`이전 조정: ${difficulty_adjustment.previous_retarget_pct > 0 ? '+' : ''}${difficulty_adjustment.previous_retarget_pct.toFixed(2)}%`}
          />
          <Stat
            label="예상 조정일"
            value={formatDateFull(difficulty_adjustment.estimated_retarget_ms, true)}
            sub={`평균 블록 시간: ${difficulty_adjustment.time_avg_minutes.toFixed(1)}분`}
          />
        </Card>

        {/* 다음 반감기 */}
        <Card title="◈ 다음 반감기">
          <Stat
            label="현재 블록 높이"
            value={`#${halving.current_height.toLocaleString()}`}
          />
          <Stat
            label="반감기 블록"
            value={`#${halving.next_halving_height.toLocaleString()}`}
          />
          <Stat
            label="남은 블록"
            value={halving.blocks_remaining.toLocaleString()}
            color="var(--color-warning)"
          />
          <Stat
            label="예상 반감기 일자"
            value={formatDateFull(halving.estimated_ts)}
          />
          {/* 반감기 진행 바 */}
          <div style={{ marginTop: '6px' }}>
            <div style={{ height: '6px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{
                height: '100%',
                width: `${((210000 - halving.blocks_remaining % 210000) / 210000) * 100}%`,
                background: 'var(--color-warning)',
                boxShadow: '0 0 4px rgba(255,199,0,0.5)',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)', marginTop: '4px', textAlign: 'right' }}>
              {(((210000 - halving.blocks_remaining % 210000) / 210000) * 100).toFixed(1)}% 완료
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 2: 해시레이트 + 난이도 차트 ── */}
      <Card title={`◈ 네트워크 해시레이트 & 난이도 (1주) — 현재 ${hashrate.current_eh.toFixed(2)} EH/s`}>
        <div style={{ height: '220px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* ── Row 3: 채굴 풀 + 최근 블록 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>

        {/* 채굴 풀 */}
        <Card title={`◈ 채굴 풀 운영 (1주) — ${mining_pools.pool_count}개 풀`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mining_pools.pools.map((pool) => (
              <div key={pool.slug} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)', width: '16px', textAlign: 'right', flexShrink: 0 }}>
                  {pool.rank}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: pool.name.toLowerCase().includes('ocean') ? 'var(--primary)' : 'var(--text)', width: '120px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pool.name}
                </div>
                <div style={{ flex: 1, height: '7px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(pool.blockCount / maxBlocks) * 100}%`,
                    background: pool.name.toLowerCase().includes('ocean') ? 'var(--primary)' : 'var(--text-dim)',
                    opacity: 0.7,
                  }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', width: '32px', textAlign: 'right', flexShrink: 0 }}>
                  {pool.blockCount}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 최근 블록 */}
        <Card title="◈ 최근 블록">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr 66px 54px', gap: '4px', marginBottom: '6px' }}>
              {['높이', '풀', '보상', '시간'].map((h) => (
                <div key={h} style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>{h}</div>
              ))}
            </div>
            {recent_blocks.map((b) => (
              <div key={b.height} style={{
                display: 'grid',
                gridTemplateColumns: '76px 1fr 66px 54px',
                gap: '4px',
                padding: '5px 0',
                borderTop: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--primary)' }}>
                  #{b.height.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: b.pool.toLowerCase().includes('ocean') ? 'var(--primary)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.pool}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  {b.reward_btc.toFixed(4)}
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>
                  {timeAgo(b.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};
