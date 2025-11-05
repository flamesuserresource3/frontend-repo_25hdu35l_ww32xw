import React from 'react';
import { SlidersHorizontal, Palette, Waves } from 'lucide-react';

export default function VisualizerControls({ settings, onChange, disabled }) {
  const update = (patch) => onChange({ ...settings, ...patch });

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <SlidersHorizontal className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm text-white/70">Step 2</p>
          <h3 className="text-lg font-medium">Customize visuals</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className="text-sm text-white/70 mb-2 block">Style</label>
          <div className="flex gap-2">
            {[
              { key: 'bars', label: 'Bars', icon: Waves },
              { key: 'wave', label: 'Wave', icon: Waves },
              { key: 'circle', label: 'Circle', icon: Waves },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => update({ style: key })}
                disabled={disabled}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${
                  settings.style === key
                    ? 'bg-white text-black border-white'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-1">
          <label className="text-sm text-white/70 mb-2 block flex items-center gap-2"><Palette className="h-4 w-4" /> Color</label>
          <input
            type="color"
            value={settings.color}
            onChange={(e) => update({ color: e.target.value })}
            disabled={disabled}
            className="w-full h-10 rounded-lg bg-transparent border border-white/10 p-1"
          />
        </div>

        <div className="col-span-1">
          <label className="text-sm text-white/70 mb-2 block">Sensitivity</label>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={settings.sensitivity}
            onChange={(e) => update({ sensitivity: Number(e.target.value) })}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
