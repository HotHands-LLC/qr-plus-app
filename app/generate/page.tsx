'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

interface GeneratedCode {
  code_slug: string;
  qr_url: string;
  qr_image: string;
}

export default function GeneratePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [destUrl, setDestUrl] = useState('');
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, owner_email: email, destination_url: destUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Generation failed');
        return;
      }

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(data.qr_url, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      setGenerated({ ...data, qr_image: qrImage });
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generated) return;
    const link = document.createElement('a');
    link.href = generated.qr_image;
    link.download = `qr-plus-${generated.code_slug}.png`;
    link.click();
  };

  return (
    <div className="scan-bg min-h-screen bg-black px-6 py-8">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a href="/install" className="text-gray-600 hover:text-gray-400 transition-colors">←</a>
          <h1 className="text-xl font-bold">
            Generate QR<span className="text-amber-400">+</span> Code
          </h1>
        </div>

        {!generated ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Name / Label *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My Shop Door"
                className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Your Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Destination URL (optional)</label>
              <input
                type="url"
                value={destUrl}
                onChange={e => setDestUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full bg-gray-900 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !name.trim()}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50 mt-2"
            >
              {isGenerating ? 'Generating…' : 'Generate QR+ Code'}
            </button>

            <div className="border border-gray-800 rounded-xl p-4 mt-4">
              <p className="text-gray-600 text-xs leading-relaxed">
                Your QR+ code will point to <span className="text-amber-400">qr.hotdeck.com/[id]</span>.
                When scanned, QR+ captures the visual environment and delivers an intelligent agent response.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* QR code image */}
            <div className="border border-gray-800 rounded-2xl p-4 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generated.qr_image} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Your QR+ URL</p>
              <p className="text-amber-400 font-mono text-sm">{generated.qr_url}</p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl transition-all"
            >
              Download PNG
            </button>

            <button
              onClick={() => window.open(generated.qr_url, '_blank')}
              className="w-full border border-gray-700 hover:border-amber-400 text-gray-400 hover:text-amber-400 py-3 rounded-xl text-sm transition-all"
            >
              Test This Code →
            </button>

            <button
              onClick={() => { setGenerated(null); setName(''); setEmail(''); setDestUrl(''); }}
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              Generate Another
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-700 text-xs">Protected by US Patent Pending 19/636,192</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
