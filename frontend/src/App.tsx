/**
 * App.tsx — Sea of Corea 라우팅
 *
 * v1 구조 (런치):
 *   /          → 랜딩페이지 (public, collective hashrate 히어로)
 *   /join      → 조합원 등록
 *   /collective → /join 리디렉트
 *
 * 대시보드 기능 (추후 확장팩):
 *   /dashboard, /workers, /blocks, /earnings, /notifications
 *   → 현재 코드에서 제거 (추후 복원용 import 주석 유지)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { BootSequence } from './components/BootSequence';
import { Landing } from './pages/Landing';
import { Join } from './pages/Join';
import { Comm } from './pages/Comm';
import { Network } from './pages/Network';
/* 대시보드 확장팩 (추후 활성화)
import { Dashboard } from './pages/Dashboard';
import { Workers } from './pages/Workers';
import { Blocks } from './pages/Blocks';
import { Earnings } from './pages/Earnings';
import { Notifications } from './pages/Notifications';
import { Boot } from './pages/Boot';
*/
import { useTheme } from './hooks/useTheme';
import { applyTheme } from './theme/themes';
import { useAppStore } from './stores/store';

const BOOT_SHOWN_KEY = 'soc_boot_shown';

function AppInner() {
  useTheme();

  const [showBoot, setShowBoot] = useState(() => {
    return !sessionStorage.getItem(BOOT_SHOWN_KEY);
  });

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem(BOOT_SHOWN_KEY, '1');
    setShowBoot(false);
  }, []);

  if (showBoot) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <Layout>
      <Routes>
        {/* ── 메인 라우트 ── */}
        <Route path="/"           element={<Landing />} />
        <Route path="/join"       element={<Join />} />
        <Route path="/comm"       element={<Comm />} />
        <Route path="/network"    element={<Network />} />
        <Route path="/collective" element={<Navigate to="/join" replace />} />

        {/* ── 대시보드 확장팩 — 추후 활성화 ── */}
        {/* <Route path="/dashboard"     element={<Dashboard />} />         */}
        {/* <Route path="/workers"       element={<Workers />} />            */}
        {/* <Route path="/blocks"        element={<Blocks />} />             */}
        {/* <Route path="/earnings"      element={<Earnings />} />           */}
        {/* <Route path="/notifications" element={<Notifications />} />      */}
        {/* <Route path="/config"        element={<Boot />} />               */}

        {/* 폴백 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
