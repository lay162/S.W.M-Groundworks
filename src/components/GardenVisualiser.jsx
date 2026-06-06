import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Maximize2, AlertTriangle, ArrowRight } from 'lucide-react';
import { VISUALISER_CATEGORIES, findMaterial } from '../data/visualiserMaterials.js';

const DISCLAIMER =
  'Generated visual preview only — not an exact survey or quote. Final design, levels, drainage and price are confirmed on a site visit.';

export function GardenVisualiser({ onContinueToQuote }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [categoryId, setCategoryId] = useState(VISUALISER_CATEGORIES[0].id);
  const [materialId, setMaterialId] = useState(VISUALISER_CATEGORIES[0].materials[0].id);
  const [previewWidth, setPreviewWidth] = useState(88);
  const [previewDepth, setPreviewDepth] = useState(42);
  const [previewRotate, setPreviewRotate] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [triedMaterials, setTriedMaterials] = useState([]);

  const material = findMaterial(materialId);
  const category = VISUALISER_CATEGORIES.find((c) => c.id === categoryId) || VISUALISER_CATEGORIES[0];

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setHasInteracted(true);
    } catch {
      setCameraError(
        'Camera access is needed to preview materials in your garden. Allow camera permission, or open this page on your phone (Safari or Chrome).',
      );
      setCameraOn(false);
    }
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const selectMaterial = (id, catId) => {
    setMaterialId(id);
    setCategoryId(catId);
    setHasInteracted(true);
    const m = findMaterial(id);
    setTriedMaterials((prev) => {
      if (prev.some((x) => x.id === id)) return prev;
      return [...prev, { id, name: m.supplierLabel }];
    });
  };

  const handleContinue = () => {
    onContinueToQuote({
      finalMaterial: material,
      triedMaterials,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-left">
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 flex gap-3 items-start">
        <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={18} aria-hidden />
        <p className="text-[11px] font-bold leading-relaxed text-amber-900 tracking-tight">{DISCLAIMER}</p>
      </div>

      <p className="text-sm font-medium text-zinc-600 mb-6 leading-relaxed">
        Point your camera at your patio, driveway or garden. Switch materials below until you are happy with the look — then continue to the quote form.
      </p>

      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-black aspect-[3/4] sm:aspect-[4/3] max-h-[70vh]">
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-zinc-900 text-center px-6 z-10">
            <Camera className="text-zinc-500" size={48} aria-hidden />
            <p className="text-xs font-bold text-zinc-400 max-w-xs leading-relaxed">
              Live camera preview — best on iPhone or Android. Tap to open your rear camera.
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="px-8 py-4 bg-white text-black font-black text-[10px] tracking-[0.35em] rounded hover:bg-zinc-100"
            >
              OPEN CAMERA
            </button>
            {cameraError && <p className="text-[10px] font-bold text-red-400 max-w-sm">{cameraError}</p>}
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 h-full w-full object-cover ${cameraOn ? 'opacity-100' : 'opacity-0'}`}
        />

        {cameraOn && (
          <div
            className="absolute left-1/2 pointer-events-none border-2 border-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
            style={{
              bottom: '8%',
              width: `${previewWidth}%`,
              height: `${previewDepth}%`,
              transform: `translateX(-50%) perspective(500px) rotateX(52deg) rotateZ(${previewRotate}deg)`,
              transformOrigin: '50% 100%',
              backgroundImage: `url(${material.texture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.92,
            }}
            aria-hidden
          />
        )}

        {cameraOn && (
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-20">
            <span className="rounded bg-black/60 px-3 py-1.5 text-[9px] font-black tracking-widest text-white uppercase">
              {material.name}
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded bg-black/60 px-3 py-1.5 text-[9px] font-black tracking-widest text-white uppercase"
            >
              STOP
            </button>
          </div>
        )}
      </div>

      {cameraOn && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-3">
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest col-span-3 flex items-center gap-2">
            <Maximize2 size={12} /> Width
            <input
              type="range"
              min={40}
              max={100}
              value={previewWidth}
              onChange={(e) => {
                setPreviewWidth(Number(e.target.value));
                setHasInteracted(true);
              }}
              className="flex-1 accent-black"
            />
          </label>
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest col-span-3 flex items-center gap-2">
            <Maximize2 size={12} className="rotate-90" /> Depth
            <input
              type="range"
              min={20}
              max={60}
              value={previewDepth}
              onChange={(e) => {
                setPreviewDepth(Number(e.target.value));
                setHasInteracted(true);
              }}
              className="flex-1 accent-black"
            />
          </label>
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest col-span-3 flex items-center gap-2">
            <RotateCcw size={12} /> Rotate
            <input
              type="range"
              min={-30}
              max={30}
              value={previewRotate}
              onChange={(e) => {
                setPreviewRotate(Number(e.target.value));
                setHasInteracted(true);
              }}
              className="flex-1 accent-black"
            />
          </label>
        </div>
      )}

      <div className="mt-8">
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">Choose category</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {VISUALISER_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoryId(c.id);
                selectMaterial(c.materials[0].id, c.id);
              }}
              className={`px-4 py-2 rounded text-[10px] font-black tracking-widest uppercase border transition-colors ${
                categoryId === c.id
                  ? 'bg-black text-white border-black'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">Colours &amp; finishes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {category.materials.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMaterial(m.id, category.id)}
              className={`text-left rounded-xl border overflow-hidden transition-all ${
                materialId === m.id ? 'border-black ring-2 ring-black ring-offset-2' : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <div
                className="h-20 sm:h-24 bg-cover bg-center"
                style={{ backgroundImage: `url(${m.texture})` }}
                role="img"
                aria-label={m.name}
              />
              <div className="px-3 py-2 bg-white">
                <p className="text-[10px] font-black tracking-tight text-black">{m.name}</p>
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 line-clamp-1">
                  {m.supplierLabel}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-zinc-200 text-center">
        <p className="text-xs font-bold text-zinc-500 mb-6 max-w-md mx-auto">
          Happy with how it looks? Continue to the quote form — you will still need to describe your project in your own words.
        </p>
        <button
          type="button"
          disabled={!hasInteracted}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-black text-white font-black text-[11px] tracking-[0.4em] rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
        >
          HAPPY WITH DESIGN — REQUEST QUOTE <ArrowRight size={18} />
        </button>
        {!hasInteracted && (
          <p className="text-[10px] font-bold text-zinc-400 mt-4">Open the camera and try a material first.</p>
        )}
      </div>
    </div>
  );
}
