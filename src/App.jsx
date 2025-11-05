import React, { useState } from 'react';
import HeroSplineCover from './components/HeroSplineCover';
import TrackUploader from './components/TrackUploader';
import VisualizerControls from './components/VisualizerControls';
import VideoPreview from './components/VideoPreview';

export default function App() {
  const [track, setTrack] = useState(null);
  const [settings, setSettings] = useState({
    style: 'bars',
    color: '#ef4444',
    sensitivity: 8,
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSplineCover />

      <main className="max-w-6xl mx-auto px-6 -mt-16 md:-mt-24 relative z-10 space-y-6 pb-16">
        <TrackUploader onLoad={setTrack} />
        <VisualizerControls settings={settings} onChange={setSettings} disabled={!track} />
        <VideoPreview track={track} settings={settings} />

        <footer className="text-center text-white/50 text-xs mt-6">
          Built for artists who want visuals that move with the music.
        </footer>
      </main>
    </div>
  );
}
