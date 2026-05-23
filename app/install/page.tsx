'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRPlusLogo from '@/components/QRPlusLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (installed) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS or no prompt available — show instructions
      alert('To install: tap the Share button → "Add to Home Screen"');
      return;
    }
    setIsInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setIsInstalling(false);
  };

  const handleContinueInBrowser = () => {
    router.push('/onboard');
  };

  return (
    <div className="scan-bg min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.03) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Logo */}
        <div className="mb-8">
          <QRPlusLogo size={120} />
        </div>

        {/* Brand name */}
        <h1 className="text-6xl font-black tracking-tighter text-white mb-3">
          QR<span className="text-amber-400">+</span>
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-center text-sm tracking-widest uppercase mb-12">
          Scan. See. Respond. Intelligently.
        </p>

        {/* Gate message */}
        <div className="w-full border border-amber-400/30 rounded-lg p-4 mb-8 text-center bg-amber-400/5">
          <p className="text-amber-400 text-sm font-medium">
            This content requires QR+
          </p>
        </div>

        {/* Install button */}
        <button
          onClick={isInstalled ? handleContinueInBrowser : handleInstall}
          disabled={isInstalling}
          className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 disabled:opacity-50 mb-4"
        >
          {isInstalling ? 'Installing…' : isInstalled ? 'Open QR+' : 'Install QR+'}
        </button>

        {/* Continue in browser */}
        <button
          onClick={handleContinueInBrowser}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200 py-2"
        >
          Continue in browser →
        </button>

        {/* Patent badge */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 text-xs tracking-wider">
            Protected by US Patent Pending
          </p>
          <p className="text-gray-600 text-xs font-mono mt-1">19/636,192</p>
        </div>
      </div>
    </div>
  );
}
