"""Config GET/POST and timezone list endpoints."""

import asyncio
import logging
import os
import secrets

import pytz
from fastapi import APIRouter, Header, HTTPException
from fastapi.concurrency import run_in_threadpool

from app import background
from app.config import load_config, save_config
from app.models import AppConfig, ConfigUpdate

_log = logging.getLogger(__name__)
_ADMIN_KEY = os.environ.get("ADMIN_API_KEY", "")

router = APIRouter()


def _mask_wallet(wallet: str) -> str:
    """지갑 주소 마스킹: 앞 6자 + *** + 뒤 4자."""
    if not wallet or len(wallet) < 10:
        return wallet
    return f"{wallet[:6]}...{wallet[-4:]}"


def _require_admin(x_admin_key: str = Header(default="")) -> None:
    """ADMIN_API_KEY 헤더 검증 — 일치하지 않으면 403."""
    if not _ADMIN_KEY:
        raise HTTPException(status_code=503, detail="Admin key not configured on server")
    if not secrets.compare_digest(x_admin_key, _ADMIN_KEY):
        raise HTTPException(status_code=403, detail="Invalid admin key")


@router.get("/config", response_model=AppConfig, tags=["config"])
async def get_config() -> AppConfig:
    """Return the current dashboard configuration (wallet address masked)."""
    cfg = await run_in_threadpool(load_config)
    return AppConfig(
        wallet=_mask_wallet(cfg.get("wallet", "")),
        power_cost=float(cfg.get("power_cost", 0.12)),
        power_usage=float(cfg.get("power_usage", 3450)),
        currency=cfg.get("currency", "USD"),
        timezone=cfg.get("timezone", "America/Los_Angeles"),
        network_fee=float(cfg.get("network_fee", 0.5)),
        extended_history=bool(cfg.get("extended_history", False)),
    )


@router.post("/config", response_model=AppConfig, tags=["config"])
async def update_config(
    payload: ConfigUpdate,
    x_admin_key: str = Header(default=""),
) -> AppConfig:
    """Update dashboard configuration — requires X-Admin-Key header."""
    _require_admin(x_admin_key)
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    await run_in_threadpool(save_config, update)

    asyncio.ensure_future(_safe_refresh())

    return await get_config()


async def _safe_refresh() -> None:
    """Trigger a background metrics refresh, swallowing errors."""
    try:
        await background.trigger_refresh()
    except Exception as e:
        _log.warning("Config refresh failed after save: %s", e)


@router.get("/timezones", response_model=dict, tags=["config"])
async def list_timezones() -> dict[str, list[str]]:
    """Return all valid IANA timezone strings for the config timezone field."""
    return {"timezones": sorted(pytz.all_timezones)}
