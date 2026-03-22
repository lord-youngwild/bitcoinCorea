import React, { useState } from 'react';
import { t, tArray } from '../i18n';
import {
  fetchCollectiveStats,
  registerCollective,
  unregisterCollective,
  checkCollectiveParticipant,
} from '../api/client';

interface RegisterForm {
  wallet: string;
  display_name: string;
  is_public: boolean;
}

interface Props {
  onRegistered?: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '16px',
  }}>
    {children}
  </div>
);

export const SeaOfCoreaPanel: React.FC<Props> = ({ onRegistered }) => {
  const [form, setForm] = useState<RegisterForm>({
    wallet: '',
    display_name: '',
    is_public: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [registerMsg, setRegisterMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 탈퇴 섹션
  const [unregisterWallet, setUnregisterWallet] = useState('');
  const [unregisterMsg, setUnregisterMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [unregisterSubmitting, setUnregisterSubmitting] = useState(false);

  // 상태 확인 섹션
  const [checkWallet, setCheckWallet] = useState('');
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '8px 12px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const btnStyle: React.CSSProperties = {
    background: 'var(--primary)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: '4px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    padding: '8px 20px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterMsg(null);
    setSubmitting(true);
    try {
      const res = await registerCollective({
        wallet: form.wallet.trim(),
        display_name: form.display_name.trim(),
        is_public: form.is_public,
      });
      setRegisterMsg({ type: 'success', text: res.message });
      setForm({ wallet: '', display_name: '', is_public: false });
      onRegistered?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('collective.errors.registerFailed');
      setRegisterMsg({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm(t('collective.unregister.confirm'))) return;
    setUnregisterMsg(null);
    setUnregisterSubmitting(true);
    try {
      await unregisterCollective(unregisterWallet.trim());
      setUnregisterMsg({ type: 'success', text: t('collective.unregister.success') });
      setUnregisterWallet('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('collective.errors.unregisterFailed');
      setUnregisterMsg({ type: 'error', text: msg });
    } finally {
      setUnregisterSubmitting(false);
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckResult(null);
    setCheckLoading(true);
    try {
      await checkCollectiveParticipant(checkWallet.trim());
      setCheckResult(t('collective.checkStatus.registered'));
    } catch {
      setCheckResult(t('collective.checkStatus.notRegistered'));
    } finally {
      setCheckLoading(false);
    }
  };

  const privacyPoints = tArray('collective.privacy.points');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 등록 폼 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <SectionTitle>{t('collective.register.title')}</SectionTitle>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
              {t('collective.register.walletLabel')} *
            </label>
            <input
              style={inputStyle}
              placeholder={t('collective.register.walletPlaceholder')}
              value={form.wallet}
              onChange={(e) => setForm((f) => ({ ...f, wallet: e.target.value }))}
              required
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
              {t('collective.register.displayNameLabel')}
            </label>
            <input
              style={inputStyle}
              placeholder={t('collective.register.displayNamePlaceholder')}
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              maxLength={32}
              required
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
          }}>
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            {t('collective.register.isPublicLabel')}
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              ({t('collective.register.isPublicHint')})
            </span>
          </label>

          <button type="submit" style={btnStyle} disabled={submitting}>
            {submitting ? t('collective.register.submitting') : t('collective.register.submitButton')}
          </button>

          {registerMsg && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              background: registerMsg.type === 'success' ? 'rgba(0,255,100,0.08)' : 'rgba(255,50,50,0.08)',
              border: `1px solid ${registerMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`,
              color: registerMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            }}>
              {registerMsg.text}
            </div>
          )}
        </form>
      </div>

      {/* 상태 확인 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <SectionTitle>{t('collective.checkStatus.label')}</SectionTitle>
        <form onSubmit={handleCheck} style={{ display: 'flex', gap: '8px' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder={t('collective.register.walletPlaceholder')}
            value={checkWallet}
            onChange={(e) => setCheckWallet(e.target.value)}
            required
          />
          <button type="submit" style={{ ...btnStyle, whiteSpace: 'nowrap' }} disabled={checkLoading}>
            {t('collective.checkStatus.button')}
          </button>
        </form>
        {checkResult && (
          <div style={{
            marginTop: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: checkResult === t('collective.checkStatus.registered') ? 'var(--color-success)' : 'var(--text-dim)',
          }}>
            → {checkResult}
          </div>
        )}
      </div>

      {/* 탈퇴 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <SectionTitle>{t('collective.unregister.title')}</SectionTitle>
        <form onSubmit={handleUnregister} style={{ display: 'flex', gap: '8px' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder={t('collective.register.walletPlaceholder')}
            value={unregisterWallet}
            onChange={(e) => setUnregisterWallet(e.target.value)}
            required
          />
          <button
            type="submit"
            style={{ ...btnStyle, background: 'var(--color-error)', whiteSpace: 'nowrap' }}
            disabled={unregisterSubmitting}
          >
            {t('collective.unregister.button')}
          </button>
        </form>
        {unregisterMsg && (
          <div style={{
            marginTop: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: unregisterMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          }}>
            {unregisterMsg.text}
          </div>
        )}
      </div>

      {/* 프라이버시 안내 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          marginBottom: '8px',
          letterSpacing: '1px',
        }}>
          {t('collective.privacy.title')}
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {privacyPoints.map((point, i) => (
            <li key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-dim)',
              lineHeight: '1.6',
            }}>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
