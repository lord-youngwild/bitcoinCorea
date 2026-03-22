"""Sea of Corea Collective API 라우터."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

import aiosqlite
from app.db import get_db
from app.services.sea_of_corea_service import get_collective_stats, verify_and_register

router = APIRouter()

# Bitcoin 지갑 주소 기본 검증 (P2PKH, P2SH, Bech32)
_WALLET_RE = re.compile(r"^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$")


def _validate_wallet(wallet: str) -> str:
    wallet = wallet.strip()
    if not _WALLET_RE.match(wallet):
        raise HTTPException(status_code=400, detail="유효하지 않은 비트코인 지갑 주소입니다.")
    return wallet


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    wallet: str = Field(..., description="Bitcoin 지갑 주소")
    display_name: Optional[str] = Field(None, max_length=32, description="공개 표시 이름 (선택)")
    is_public: bool = Field(False, description="지갑주소 공개 여부")


class RegisterResponse(BaseModel):
    ok: bool
    message: str
    wallet: str


class ParticipantResponse(BaseModel):
    wallet: str
    display_name: Optional[str]
    is_public: bool
    registered_at: str
    last_verified_at: Optional[str]
    last_hashrate_ths: Optional[float]
    last_hashrate_updated: Optional[str]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/collective/register", response_model=RegisterResponse, tags=["collective"])
async def register_participant(
    body: RegisterRequest,
    db: aiosqlite.Connection = Depends(get_db),
):
    """Sea of Corea Collective에 참가자 등록.

    Ocean.xyz API를 통해 실제 채굴 여부를 검증한 뒤 등록합니다.
    저장 항목: 지갑 주소, 해시레이트, 표시 이름(선택), 공개 여부.
    비수집 항목: 개인 식별 정보 (이메일, 전화번호 등).
    """
    wallet = _validate_wallet(body.wallet)

    # 이미 등록 여부 확인
    async with db.execute(
        "SELECT wallet FROM sea_of_corea_participants WHERE wallet = ?", (wallet,)
    ) as cur:
        existing = await cur.fetchone()

    if existing:
        raise HTTPException(status_code=409, detail="이미 등록된 지갑 주소입니다.")

    # Ocean API 검증 및 초기 해시레이트 조회
    verified, initial_hashrate = await verify_and_register(wallet)
    if not verified:
        raise HTTPException(
            status_code=422,
            detail="Ocean.xyz에서 해당 지갑을 찾을 수 없습니다. Ocean 풀에서 채굴 중인지 확인해주세요.",
        )

    now = datetime.now(timezone.utc).isoformat()
    display_name = (body.display_name or "").strip() or None

    await db.execute(
        """INSERT INTO sea_of_corea_participants
           (wallet, display_name, is_public, registered_at, last_verified_at,
            last_hashrate_ths, last_hashrate_updated)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            wallet,
            display_name,
            int(body.is_public),
            now,
            now,
            initial_hashrate,
            now if initial_hashrate is not None else None,
        ),
    )
    await db.commit()

    return RegisterResponse(
        ok=True,
        message="Sea of Corea Collective에 성공적으로 등록되었습니다! 🌊",
        wallet=wallet,
    )


@router.delete("/collective/unregister/{wallet}", tags=["collective"])
async def unregister_participant(
    wallet: str,
    db: aiosqlite.Connection = Depends(get_db),
):
    """Collective에서 참가자 탈퇴. 모든 저장 데이터를 삭제합니다."""
    wallet = _validate_wallet(wallet)

    async with db.execute(
        "DELETE FROM sea_of_corea_participants WHERE wallet = ?", (wallet,)
    ) as cur:
        deleted = cur.rowcount

    await db.commit()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="등록되지 않은 지갑 주소입니다.")

    return {"ok": True, "message": "Collective 탈퇴가 완료되었습니다.", "wallet": wallet}


@router.get("/collective/stats", tags=["collective"])
async def get_stats(db: aiosqlite.Connection = Depends(get_db)):
    """커뮤니티 전체 통계 조회.

    Ocean API에서 실시간으로 해시레이트를 조회하고 DB에 업데이트합니다.
    """
    async with db.execute(
        """SELECT wallet, display_name, is_public, last_hashrate_ths
           FROM sea_of_corea_participants"""
    ) as cur:
        rows = await cur.fetchall()

    participants = [
        {
            "wallet": row["wallet"],
            "display_name": row["display_name"],
            "is_public": bool(row["is_public"]),
            "last_hashrate_ths": row["last_hashrate_ths"],
        }
        for row in rows
    ]

    stats = await get_collective_stats(participants)

    # 해시레이트 업데이트를 DB에 저장
    hashrate_updates: dict = stats.pop("hashrate_updates", {})
    if hashrate_updates:
        now = datetime.now(timezone.utc).isoformat()
        for wallet, ths in hashrate_updates.items():
            await db.execute(
                """UPDATE sea_of_corea_participants
                   SET last_hashrate_ths = ?, last_hashrate_updated = ?, last_verified_at = ?
                   WHERE wallet = ?""",
                (ths, now, now, wallet),
            )
        await db.commit()

    return stats


@router.get(
    "/collective/participant/{wallet}",
    response_model=ParticipantResponse,
    tags=["collective"],
)
async def get_participant(
    wallet: str,
    db: aiosqlite.Connection = Depends(get_db),
):
    """특정 지갑의 Collective 등록 정보 조회."""
    wallet = _validate_wallet(wallet)

    async with db.execute(
        """SELECT wallet, display_name, is_public, registered_at, last_verified_at,
                  last_hashrate_ths, last_hashrate_updated
           FROM sea_of_corea_participants WHERE wallet = ?""",
        (wallet,),
    ) as cur:
        row = await cur.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="등록되지 않은 지갑 주소입니다.")

    return ParticipantResponse(
        wallet=row["wallet"],
        display_name=row["display_name"],
        is_public=bool(row["is_public"]),
        registered_at=row["registered_at"],
        last_verified_at=row["last_verified_at"],
        last_hashrate_ths=row["last_hashrate_ths"],
        last_hashrate_updated=row["last_hashrate_updated"],
    )
