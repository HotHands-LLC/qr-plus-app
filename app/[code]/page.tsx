'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import CameraViewfinder from '@/components/CameraViewfinder';

interface ScanResult {
  agent_response: string;
  context_analysis?: {
    surface?: string;
    environment?: string;
    lighting?: string;
    brands_visible?: string[];
    context_summary?: string;
  };
  code_info?: {
    code_slug: string;
    agent_id?: string;
  };
}

export default function CodePage() {
  const params = useParams();
  const codeSlug = params.code as string;

  const [phase, setPhase] = useState<'scanning' | 'capturing' | 'analyzing' | 'result' | 'unknown'>('scanning');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    // Start scan flow after brief delay (simulate QR detection)
    const timer = setTimeout(() => {
      setPhase('capturing');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleImageCaptured = async (imageBase64: string) => {
    setCapturedImageData(imageBase64);
    setPhase('analyzing');

    try {
      const userId = localStorage.getItem('qrplus_user_id') || undefined;
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_slug: codeSlug,
          image_base64: imageBase64,
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'code_not_found') {
          setPhase('unknown');
        } else {
          setError(data.error || 'Analysis failed');
          setPhase('result');
        }
        return;
      }

      setResult(data);
      setPhase('result');
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
      setPhase('result');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-900">
        <div className="text-amber-400 font-black text-xl">QR+</div>
        <div className="text-gray-600 text-xs font-mono">/{codeSlug}</div>
        <div className="w-8" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {(phase === 'scanning' || phase === 'capturing' || phase === 'analyzing') && (
          <div className="flex-1 relative">
            <CameraViewfinder
              onCapture={handleImageCaptured}
              shouldCapture={phase === 'capturing'}
            />

            {/* Status overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              {phase === 'scanning' && (
                <div className="text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse-amber" />
                    <span className="text-amber-400 text-sm font-medium tracking-wider uppercase">QR+ Detected</span>
                  </div>
                  <p className="text-gray-500 text-xs">Reading visual environment…</p>
                </div>
              )}

              {phase === 'capturing' && (
                <div className="text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse-amber" />
                    <span className="text-amber-400 text-sm font-medium tracking-wider uppercase">Capturing Context</span>
                  </div>
                  <p className="text-gray-500 text-xs">Analyzing surroundings for agent context</p>
                </div>
              )}

              {phase === 'analyzing' && (
                <div className="text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-amber" />
                    <span className="text-green-400 text-sm font-medium tracking-wider uppercase">Analyzing</span>
                  </div>
                  <p className="text-gray-500 text-xs">AI processing visual environment…</p>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            {error ? (
              <div className="border border-red-900 bg-red-900/10 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : result ? (
              <>
                {/* Agent response */}
                <div className="border border-amber-400/20 bg-amber-400/5 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">
                      Agent Response
                    </span>
                    {result.code_info?.agent_id && (
                      <span className="text-gray-600 text-xs ml-auto">{result.code_info.agent_id}</span>
                    )}
                  </div>
                  <p className="text-white text-base leading-relaxed">{result.agent_response}</p>
                </div>

                {/* Context analysis */}
                {result.context_analysis && (
                  <div className="border border-gray-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full" />
                      <span className="text-gray-500 text-xs tracking-wider uppercase">Visual Context</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {result.context_analysis.surface && (
                        <div>
                          <div className="text-gray-600 text-xs mb-1">Surface</div>
                          <div className="text-gray-300 text-sm">{result.context_analysis.surface}</div>
                        </div>
                      )}
                      {result.context_analysis.environment && (
                        <div>
                          <div className="text-gray-600 text-xs mb-1">Environment</div>
                          <div className="text-gray-300 text-sm">{result.context_analysis.environment}</div>
                        </div>
                      )}
                      {result.context_analysis.lighting && (
                        <div>
                          <div className="text-gray-600 text-xs mb-1">Lighting</div>
                          <div className="text-gray-300 text-sm">{result.context_analysis.lighting}</div>
                        </div>
                      )}
                      {result.context_analysis.brands_visible && result.context_analysis.brands_visible.length > 0 && (
                        <div>
                          <div className="text-gray-600 text-xs mb-1">Brands Visible</div>
                          <div className="text-gray-300 text-sm">{result.context_analysis.brands_visible.join(', ')}</div>
                        </div>
                      )}
                    </div>
                    {result.context_analysis.context_summary && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="text-gray-600 text-xs mb-1">Summary</div>
                        <div className="text-gray-400 text-sm leading-relaxed">{result.context_analysis.context_summary}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Captured image thumbnail */}
                {capturedImageData && (
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={capturedImageData}
                      alt="Captured environment"
                      className="w-full h-32 object-cover opacity-60"
                    />
                  </div>
                )}

                {/* Scan again button */}
                <button
                  onClick={() => {
                    hasScanned.current = false;
                    setPhase('scanning');
                    setResult(null);
                    setError(null);
                    setCapturedImageData(null);
                    setTimeout(() => {
                      setPhase('capturing');
                      hasScanned.current = true;
                    }, 1500);
                  }}
                  className="w-full border border-gray-700 hover:border-amber-400 text-gray-400 hover:text-amber-400 py-3 rounded-xl text-sm transition-all"
                >
                  Scan Again
                </button>
              </>
            ) : null}
          </div>
        )}

        {phase === 'unknown' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-5xl mb-6">🔲</div>
            <h2 className="text-xl font-bold mb-3">Unregistered QR+ Code</h2>
            <p className="text-gray-500 mb-2">Code: <span className="font-mono text-amber-400">/{codeSlug}</span></p>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              This QR+ code hasn&apos;t been registered yet. Register it to connect it to a brand or agent.
            </p>
            <a
              href="/generate"
              className="w-full max-w-xs bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-center block transition-all"
            >
              Register This Code
            </a>
          </div>
        )}
      </div>

      {/* Patent footer */}
      <div className="px-4 py-3 border-t border-gray-900 text-center">
        <p className="text-gray-800 text-xs">US Patent Pending 19/636,192</p>
      </div>
    </div>
  );
}
