'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'camera' | 'microphone' | 'notifications' | 'identity';

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('camera');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop());
      setPermissions(p => ({ ...p, camera: true }));
    } catch {
      setPermissions(p => ({ ...p, camera: false }));
    }
    setStep('microphone');
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setPermissions(p => ({ ...p, mic: true }));
    } catch {
      setPermissions(p => ({ ...p, mic: false }));
    }
    setStep('notifications');
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermissions(p => ({ ...p, notifications: result === 'granted' }));
    }
    setStep('identity');
  };

  const handleEmailSignup = async () => {
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, permissions }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('qrplus_user_id', data.userId);
        localStorage.setItem('qrplus_email', email);
        router.push('/demo');
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const steps: Step[] = ['camera', 'microphone', 'notifications', 'identity'];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="scan-bg min-h-screen bg-black flex flex-col items-center justify-center px-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= stepIndex ? 'bg-amber-400' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="max-w-sm w-full animate-fade-in" key={step}>
        {step === 'camera' && (
          <div className="text-center">
            <div className="text-6xl mb-6">📷</div>
            <h2 className="text-2xl font-bold mb-3">Camera Access</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              QR+ uses your camera to understand the visual environment around each QR code. 
              This is the core of the patent — context-aware intelligence.
            </p>
            <button
              onClick={requestCamera}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-all"
            >
              Allow Camera
            </button>
            <p className="text-gray-700 text-xs mt-4">Required for core functionality</p>
          </div>
        )}

        {step === 'microphone' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎤</div>
            <h2 className="text-2xl font-bold mb-3">Microphone Access</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Talk to agents hands-free. Ask follow-up questions after scanning without touching your phone.
            </p>
            <button
              onClick={requestMic}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-all mb-3"
            >
              Allow Microphone
            </button>
            <button
              onClick={() => setStep('notifications')}
              className="w-full text-gray-500 hover:text-gray-300 py-3 text-sm transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 'notifications' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🔔</div>
            <h2 className="text-2xl font-bold mb-3">Notifications</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Get agent responses even when the app is closed. Get notified when context analysis completes.
            </p>
            <button
              onClick={requestNotifications}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-all mb-3"
            >
              Allow Notifications
            </button>
            <button
              onClick={() => setStep('identity')}
              className="w-full text-gray-500 hover:text-gray-300 py-3 text-sm transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 'identity' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-2xl font-bold mb-3">Create Your Identity</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Your identity is stored securely. Agents remember you across scans and devices.
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-600 mb-4 outline-none transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleEmailSignup()}
            />
            <button
              onClick={handleEmailSignup}
              disabled={isSubmitting || !email.includes('@')}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50 mb-4"
            >
              {isSubmitting ? 'Setting up…' : 'Continue with Email'}
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-700 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
            <button
              onClick={() => router.push('/demo')}
              className="w-full border border-gray-700 hover:border-gray-500 text-gray-300 font-medium py-4 rounded-xl text-sm transition-all mb-3"
            >
              Use Face ID / Passkey
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
            >
              Skip — try demo without account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
