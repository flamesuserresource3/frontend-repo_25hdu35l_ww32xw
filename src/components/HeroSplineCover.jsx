import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroSplineCover() {
  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/QrI46EbSvyxcmozb/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1 text-xs md:text-sm mb-6 backdrop-blur">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Live audio-reactive visuals
        </div>
        <h1 className="text-3xl md:text-6xl font-semibold tracking-tight leading-tight">
          Turn your tracks into stunning, synced music videos
        </h1>
        <p className="mt-4 md:mt-6 text-white/80 max-w-2xl mx-auto">
          Upload a song, customize the visualizer, and export a high-quality video—perfectly in time with your music.
        </p>
      </div>
    </section>
  );
}
