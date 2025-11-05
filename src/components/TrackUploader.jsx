import React, { useRef } from 'react';
import { Upload, Music } from 'lucide-react';

export default function TrackUploader({ onLoad }) {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onLoad({ file, url, name: file.name });
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6 text-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Music className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Step 1</p>
              <h3 className="text-lg font-medium">Upload your track</h3>
            </div>
          </div>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              onChange={handleChange}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
            >
              <Upload className="h-4 w-4" /> Choose file
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/60">Supports MP3, WAV, AAC, and more. Your file stays in your browser.</p>
      </div>
    </div>
  );
}
