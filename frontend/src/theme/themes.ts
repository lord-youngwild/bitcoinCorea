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
    primary: '#00e5ff',
    primaryDim: '#0077a8',
    primaryGlow: 'rgba(0, 229, 255, 0.35)',
    bg: '#040c10',
    bgCard: '#071520',
    bgHover: '#0d2540',
    text: '#a0ecff',
    textDim: '#3a7a90',
    border: '#005570',
    borderGlow: 'rgba(0, 229, 255, 0.2)',
    scanlineColor: 'rgba(0, 229, 255, 0.03)',
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
