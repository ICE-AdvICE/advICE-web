import React, { useEffect, useState } from 'react';

export const AppInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canPrompt, setCanPrompt] = useState(false); // prompt 가능한지 여부

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (canPrompt && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('사용자 설치 완료');
      } else {
        console.log('사용자 설치 취소');
      }

      setDeferredPrompt(null);
      setCanPrompt(false);
    } else {
      // fallback: 설치 방법 안내
      alert('앱을 설치하려면 브라우저 메뉴에서 "홈 화면에 추가"를 눌러주세요.');
    }
  };

  return (
    <button
      onClick={handleInstall}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#1e88e5',
        color: '#fff',
        padding: '12px 16px',
        fontSize: '15px',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
      }}
    >
      📲 앱 설치하기
    </button>
  );
};
