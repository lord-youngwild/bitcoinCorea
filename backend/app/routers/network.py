"""Network stats endpoint — fetches Bitcoin mining data from local Mempool node."""

from __future__ import annotations

import logging
import os
import ssl
import time

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()
_log = logging.getLogger(__name__)

# Local Mempool node URL (StartOS) — override via MEMPOOL_LOCAL_URL env var
MEMPOOL_LOCAL = os.environ.get(
    "MEMPOOL_LOCAL_URL",
    "https://rwbq5qjtjlvuje4d5jrqddzntadcmjnzqkr2bwmmjjnmrey73bjr2iqd.local",
)
_TIMEOUT = httpx.Timeout(15.0, connect=8.0)


def _client() -> httpx.AsyncClient:
    """Return an AsyncClient that skips TLS verification for .local certs."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return httpx.AsyncClient(verify=False, timeout=_TIMEOUT)


def _hashrate_eh(raw: float) -> float:
    """Convert raw hashrate (H/s) to EH/s rounded to 2 dp."""
    return round(raw / 1e18, 2)


@router.get("/network/stats", tags=["network"])
async def get_network_stats():
    """Aggregate Bitcoin network mining stats from the local Mempool node."""
    base = MEMPOOL_LOCAL

    async with _client() as client:
        try:
            r_reward, r_diff, r_pools, r_hashrate, r_blocks = await _gather(
                client, base
            )
        except httpx.HTTPError as e:
            _log.warning("Mempool local node unreachable: %s", e)
            raise HTTPException(status_code=502, detail="Local Mempool node unreachable")

    # ── 보상 관련 데이터 (144블록) ──────────────────────────────────────────
    reward = r_reward
    total_reward_btc = int(reward.get("totalReward", 0)) / 1e8
    total_fee_sat = int(reward.get("totalFee", 0))
    total_tx = int(reward.get("totalTx", 1)) or 1
    block_count_144 = int(reward.get("endBlock", 0)) - int(reward.get("startBlock", 0)) or 144

    avg_block_fee_btc = (total_fee_sat / block_count_144) / 1e8
    avg_tx_fee_sat = total_fee_sat / total_tx

    # ── 난이도 조정 ─────────────────────────────────────────────────────────
    diff = r_diff
    remaining_blocks = int(diff.get("remainingBlocks", 0))
    difficulty_change_pct = round(float(diff.get("difficultyChange", 0)), 4)
    estimated_retarget_ms = int(diff.get("estimatedRetargetDate", 0))
    next_retarget_height = int(diff.get("nextRetargetHeight", 0))
    progress_pct = round(float(diff.get("progressPercent", 0)), 2)
    previous_retarget_pct = round(float(diff.get("previousRetarget", 0)), 4)
    time_avg_minutes = round(float(diff.get("timeAvg", 600000)) / 60000, 2)

    # ── 다음 반감기 ─────────────────────────────────────────────────────────
    current_height = int(reward.get("endBlock", 0))
    HALVING_INTERVAL = 210_000
    next_halving_height = ((current_height // HALVING_INTERVAL) + 1) * HALVING_INTERVAL
    blocks_to_halving = next_halving_height - current_height
    # Estimate date using average block time
    avg_block_sec = float(diff.get("timeAvg", 600000)) / 1000
    seconds_to_halving = blocks_to_halving * avg_block_sec
    halving_estimated_ts = int(time.time() + seconds_to_halving)

    # ── 채굴 풀 운영 (1주) ──────────────────────────────────────────────────
    pools_raw = r_pools.get("pools", [])
    pool_count = len(pools_raw)
    pools = [
        {
            "rank": p.get("rank"),
            "name": p.get("name"),
            "blockCount": p.get("blockCount"),
            "slug": p.get("slug"),
        }
        for p in pools_raw
    ]

    # ── 해시레이트 차트 (1주) ───────────────────────────────────────────────
    hashrates_raw = r_hashrate.get("hashrates", [])
    difficulties_raw = r_hashrate.get("difficulty", [])
    current_hashrate_eh = _hashrate_eh(float(r_hashrate.get("currentHashrate", 0)))
    current_difficulty = float(r_hashrate.get("currentDifficulty", 0))

    hashrate_chart = [
        {
            "timestamp": h.get("timestamp"),
            "hashrate_eh": _hashrate_eh(float(h.get("avgHashrate", 0))),
        }
        for h in hashrates_raw
    ]
    difficulty_chart = [
        {
            "timestamp": d.get("time"),
            "difficulty": float(d.get("difficulty", 0)),
        }
        for d in difficulties_raw
    ]

    # ── 최근 블록 ──────────────────────────────────────────────────────────
    recent_blocks = [
        {
            "height": b.get("height"),
            "hash": b.get("id", "")[:16] + "...",
            "tx_count": b.get("tx_count"),
            "size_kb": round(b.get("size", 0) / 1024, 1),
            "pool": (b.get("extras") or {}).get("pool", {}).get("name") or "Unknown"
                if isinstance((b.get("extras") or {}).get("pool"), dict)
                else (b.get("extras") or {}).get("pool") or "Unknown",
            "reward_btc": round(int((b.get("extras") or {}).get("reward", 0)) / 1e8, 8),
            "fees_btc": round(int((b.get("extras") or {}).get("totalFees", 0)) / 1e8, 8),
            "timestamp": b.get("timestamp"),
        }
        for b in r_blocks[:15]
    ]

    return {
        "reward_stats": {
            "blocks": block_count_144,
            "total_reward_btc": round(total_reward_btc, 8),
            "avg_block_fee_btc": round(avg_block_fee_btc, 8),
            "avg_tx_fee_sat": round(avg_tx_fee_sat, 2),
            "total_tx": total_tx,
        },
        "difficulty_adjustment": {
            "progress_pct": progress_pct,
            "remaining_blocks": remaining_blocks,
            "difficulty_change_pct": difficulty_change_pct,
            "estimated_retarget_ms": estimated_retarget_ms,
            "next_retarget_height": next_retarget_height,
            "previous_retarget_pct": previous_retarget_pct,
            "time_avg_minutes": time_avg_minutes,
        },
        "halving": {
            "current_height": current_height,
            "next_halving_height": next_halving_height,
            "blocks_remaining": blocks_to_halving,
            "estimated_ts": halving_estimated_ts,
        },
        "mining_pools": {
            "period": "1w",
            "pool_count": pool_count,
            "pools": pools,
        },
        "hashrate": {
            "current_eh": current_hashrate_eh,
            "current_difficulty": current_difficulty,
            "chart": hashrate_chart,
            "difficulty_chart": difficulty_chart,
        },
        "recent_blocks": recent_blocks,
    }


async def _gather(client: httpx.AsyncClient, base: str):
    """Fetch all required endpoints concurrently."""
    import asyncio

    async def get(path: str):
        r = await client.get(f"{base}{path}")
        r.raise_for_status()
        return r.json()

    results = await asyncio.gather(
        get("/api/v1/mining/reward-stats/144"),
        get("/api/v1/difficulty-adjustment"),
        get("/api/v1/mining/pools/1w"),
        get("/api/v1/mining/hashrate/1w"),
        get("/api/blocks"),
    )
    return results
