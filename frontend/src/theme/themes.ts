import { Theme } from '../types';

export interface ThemeDefinition {
  id: Theme;
  label: string;
  primary: string;
  primaryDim: string;
  primaryGlow: string;
  bg: string;
  bgCard: string;
  bgHover: string;
  text: string;
  textDim: string;
  border: string;
  borderGlow: string;
  scanlineColor: string;
}

export const THEMES: Record<Theme, ThemeDefinition> = {
  sea: {
    id: 'sea',
    label: '🌊 SEA',
    primary: '#20B2AA',
    primaryDim: '#117a74',
    primaryGlow: 'rgba(32, 178, 170, 0.35)',
    bg: '#04060f',
    bgCard: '#090e20',
    bgHover: '#0a1a1a',
    text: '#6ed8d2',
    textDim: '#1a6e6a',
    border: '#124a48',
    borderGlow: 'rgba(32, 178, 170, 0.2)',
    scanlineColor: 'rgba(32, 178, 170, 0.03)',
  },
  bitcoin: {
    id: 'bitcoin',
    label: '₿ BTC',
    primary: '#f2a900',
    primaryDim: '#b07800',
    primaryGlow: 'rgba(242, 169, 0, 0.4)',
    bg: '#0a0800',
    bgCard: '#1a1200',
    bgHover: '#221800',
    text: '#f5d680',
    textDim: '#8a6a00',
    border: '#6a4d00',
    borderGlow: 'rgba(242, 169, 0, 0.3)',
    scanlineColor: 'rgba(242, 169, 0, 0.04)',
  },
  matrix: {
    id: 'matrix',
    label: '# MTX',
    primary: '#39ff14',
    primaryDim: '#1aaa00',
    primaryGlow: 'rgba(57, 255, 20, 0.4)',
    bg: '#000a00',
    bgCard: '#001400',
    bgHover: '#002200',
    text: '#88ff66',
    textDim: '#2a7700',
    border: '#005500',
    borderGlow: 'rgba(57, 255, 20, 0.3)',
    scanlineColor: 'rgba(57, 255, 20, 0.04)',
  },
};

export function applyTheme(theme: Theme): void {
  const t = THEMES[theme];
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.setProperty('--primary', t.primary);
  root.style.setProperty('--primary-dim', t.primaryDim);
  root.style.setProperty('--primary-glow', t.primaryGlow);
  root.style.setProperty('--bg', t.bg);
  root.style.setProperty('--bg-card', t.bgCard);
  root.style.setProperty('--bg-hover', t.bgHover);
  root.style.setProperty('--text', t.text);
  root.style.setProperty('--text-dim', t.textDim);
  root.style.setProperty('--border', t.border);
  root.style.setProperty('--border-glow', t.borderGlow);
  root.style.setProperty('--scanline', t.scanlineColor);
}
