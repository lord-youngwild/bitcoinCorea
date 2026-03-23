"""Sea of Corea Collective — core business logic.

한국 비트코인 채굴자 커뮤니티 집계 서비스.

수집 항목: 지갑 주소, 해시레이트 (채굴 통계 집계 목적)
비수집 항목: 개인 식별 정보 — 표시 이름(display_name)은 사용자가 선택적으로 제공하며
             커뮤니티 순위 표시 외 용도로 사용하지 않습니다.
"""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

from app.models import format_hashrate, convert_to_ths

_log = logging.getLogger(__name__)

API_BASE = "https://api.ocean.xyz/v1"

DATUM_LOCAL_URL = os.environ.get(
    "DATUM_LOCAL_URL",
    "https://ujhd7ivjwisu7c4thp4ksod2eqjjlxoebpiblovfyfy75qltk247i6id.local",
)
FOUNDATION_DISPLAY_NAME = "Sea of Corea BCP 채굴풀노드"


async def _fetch_datum_hashrate() -> Optional[float]:
    """DATUM 게이트웨이 상태 페이지에서 해시레이트를 TH/s로 반환."""
    try:
        async with httpx.AsyncClient(verify=False, timeout=8.0) as client:
            resp = await client.get(DATUM_LOCAL_URL)
            resp.raise_for_status()
            match = re.search(r"Estimated Hashrate.*?<td>([\d.]+)\s*Th/sec", resp.text, re.DOTALL)
            if match:
                return float(match.group(1))
    except Exception as e:
        _log.debug("DATUM hashrate fetch failed: %s", e)
    return None


async def _fetch_wallet_hashrate(client: httpx.AsyncClient, wallet: str) -> Optional[float]:
    """Ocean API에서 지갑의 3hr 해시레이트를 TH/s 단위로 조회."""
    try:
        resp = await client.get(
            f"{API_BASE}/user_hashrate/{wallet}",
            timeout=10,
            headers={"User-Agent": "SeaOfCorea-Dashboard/1.0"},
        )
        resp.raise_for_status()
        data = resp.json().get("result", {}) or {}
        raw = (
            data.get("hashrate_10800s")
            or data.get("hashrate_7200s")
            or data.get("hashrate_3600s")
            or data.get("hashrate_60s")
        )
        if raw is None:
            return None
        return convert_to_ths(float(raw), "H/s")
    except Exception as e:
        _log.debug("Failed to fetch hashrate for wallet %s: %s", wallet[:8] + "...", e)
        return None


async def _verify_wallet_on_ocean(client: httpx.AsyncClient, wallet: str) -> bool:
    """Ocean API에서 해당 지갑이 실제 채굴 활동이 있는지 확인."""
    try:
        resp = await client.get(
            f"{API_BASE}/statsnap/{wallet}",
            timeout=10,
            headers={"User-Agent": "SeaOfCorea-Dashboard/1.0"},
        )
        if resp.status_code == 404:
            return False
        resp.raise_for_status()
        result = resp.json().get("result")
        return result is not None
    except Exception as e:
        _log.debug("Ocean verification failed for wallet %s: %s", wallet[:8] + "...", e)
        return False


async def get_collective_stats(
    participants: list[dict],
) -> dict[str, Any]:
    """참가자 목록의 커뮤니티 통계를 조회하여 반환.

    Ocean API에서 실시간으로 각 참가자의 해시레이트를 조회하고 집계합니다.
    조회된 해시레이트는 DB에 저장됩니다 (last_hashrate_ths, last_hashrate_updated).

    Args:
        participants: DB에서 조회한 참가자 row 목록.
            각 row는 wallet, display_name, is_public, last_hashrate_ths 필드를 가짐.

    Returns:
        집계 통계 딕셔너리:
        - total_participants: 전체 등록 참가자 수
        - active_participants: 해시레이트가 0보다 큰 참가자 수
        - total_hashrate: 총 해시레이트 (float)
        - total_hashrate_unit: 단위 문자열 (e.g. "TH/s", "PH/s")
        - public_participants: 공개 참가자 목록 (display_name, hashrate)
        - fetched_at: 조회 시각 (ISO 8601)
        - hashrate_updates: 업데이트된 참가자 해시레이트 {wallet: ths} (DB 업데이트용)
    """
    # DATUM 파운데이션 노드 해시레이트 (지갑 주소 없음)
    datum_ths = await _fetch_datum_hashrate()

    foundation_total_ths = datum_ths or 0.0
    foundation_entry: Optional[dict] = None
    if datum_ths and datum_ths > 0:
        val_f, unit_f = format_hashrate(datum_ths)
        foundation_entry = {
            "display_name": FOUNDATION_DISPLAY_NAME,
            "hashrate": val_f,
            "hashrate_unit": unit_f,
            "is_foundation": True,
        }

    if not participants:
        public_list = [foundation_entry] if foundation_entry else []
        fval, funit = format_hashrate(foundation_total_ths) if foundation_total_ths > 0 else (0.0, "TH/s")
        return {
            "total_participants": 0,
            "active_participants": 1 if foundation_entry else 0,
            "total_hashrate": fval,
            "total_hashrate_unit": funit,
            "public_participants": public_list,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "hashrate_updates": {},
        }

    total_ths = foundation_total_ths
    active_count = 1 if foundation_entry else 0
    public_list: list[dict] = [foundation_entry] if foundation_entry else []
    hashrate_updates: dict[str, float] = {}

    async with httpx.AsyncClient(follow_redirects=True) as client:
        for row in participants:
            wallet = row["wallet"]
            hr_ths = await _fetch_wallet_hashrate(client, wallet)

            # 해시레이트 업데이트 기록 (DB 저장을 위해 반환)
            if hr_ths is not None:
                hashrate_updates[wallet] = hr_ths

            # 저장된 값 또는 새로 조회한 값 사용
            effective_hr = hr_ths if hr_ths is not None else (row.get("last_hashrate_ths") or 0.0)

            if effective_hr > 0:
                active_count += 1
                total_ths += effective_hr

                display_name = row["display_name"] or wallet[:8] + "..."
                val, unit = format_hashrate(effective_hr)
                entry = {
                    "display_name": display_name,
                    "hashrate": val,
                    "hashrate_unit": unit,
                }
                if row["is_public"]:
                    entry["wallet"] = wallet
                public_list.append(entry)

    val, unit = format_hashrate(total_ths) if total_ths > 0 else (0.0, "TH/s")

    return {
        "total_participants": len(participants),
        "active_participants": active_count,
        "total_hashrate": val,
        "total_hashrate_unit": unit,
        "public_participants": public_list,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "hashrate_updates": hashrate_updates,
    }


async def verify_and_register(wallet: str) -> tuple[bool, Optional[float]]:
    """Ocean에서 지갑을 검증하고 초기 해시레이트를 반환.

    Returns:
        (verified, hashrate_ths) 튜플.
        verified=True이면 Ocean에 등록된 지갑.
        hashrate_ths는 현재 해시레이트 (TH/s), 없으면 None.
    """
    async with httpx.AsyncClient(follow_redirects=True) as client:
        verified = await _verify_wallet_on_ocean(client, wallet)
        if not verified:
            return False, None
        hr_ths = await _fetch_wallet_hashrate(client, wallet)
        return True, hr_ths
