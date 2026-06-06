import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Maximize2, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  VISUALISER_CATEGORIES,
  COBBLED_EDGE_TEXTURE,
  findMaterial,
  getTileRepeatPreset,
  materialImageUrl,
  materialShowsCobbledEdge,
} from '../data/visualiserMaterials.js';

const DISCLAIMER =
  'Generated visual preview only — not an exact survey or quote. Final design, levels and drainage are assessed on a site visit; your price and quotation are confirmed after that visit, not during it.';

function MaterialThumb({ material, selected, onSelect }) {
  const [failed, setFailed] = useState(false);
  const src = materialImageUrl(material.texture);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-xl border overflow-hidden transition-all ${
        selected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-zinc-200 hover:border-zinc-400'
      }`}
    >
      <div className="relative h-24 sm:h-28 bg-zinc-100">
        {!failed ? (
          <img
            src={src}
            alt={material.name}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400">
            Preview unavailable
          </div>
        )}
      </div>
      <div className="px-3 py-2 bg-white">
        <p className="text-[10px] font-black tracking-tight text-black">{material.name}</p>
        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 line-clamp-2">
          {material.supplierLabel}
        </p>
      </div>
    </button>
  );
}

export function GardenVisualiser({
  cameraStream,
  cameraError = '',
  onRequestCamera,
  onStopCamera,
  onContinueToQuote,
}) {
  const videoRef = useRef(null);
  const [categoryId, setCategoryId] = useState(VISUALISER_CATEGORIES[0].id);
  const [materialId, setMaterialId] = useState(VISUALISER_CATEGORIES[0].materials[0].id);
  const [previewWidth, setPreviewWidth] = useState(88);
  const [previewDepth, setPreviewDepth] = useState(42);
  const [previewRotate, setPreviewRotate] = useState(0);
  const [tileSize, setTileSize] = useState(100);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [triedMaterials, setTriedMaterials] = useState([]);
  const [selectedPreviewFailed, setSelectedPreviewFailed] = useState(false);

  const material = findMaterial(materialId);
  const category = VISUALISER_CATEGORIES.find((c) => c.id === categoryId) || VISUALISER_CATEGORIES[0];
  const cameraOn = Boolean(cameraStream);
  const materialSrc = materialImageUrl(material.texture);
  const edgeSrc = materialImageUrl(COBBLED_EDGE_TEXTURE);
  const showCobbledEdge = Boolean(material.cameraEdgeOverlay);
  const showsEdgeInPhoto = materialShowsCobbledEdge(material);
  const tilePreset = getTileRepeatPreset(categoryId);
  const tileScale = tileSize / 100;
  const overlayTileStyle = tilePreset.repeat
    ? {
        backgroundRepeat: 'repeat',
        backgroundSize: `${tilePreset.tileWidthPct * tileScale}% ${tilePreset.tileHeightPct * tileScale}%`,
        backgroundPosition: 'center',
      }
    : {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };

  useEffect(() => {
    setSelectedPreviewFailed(false);
  }, [material.texture]);

  useEffect(() => {
    VISUALISER_CATEGORIES.forEach((cat) => {
      cat.materials.forEach((m) => {
        const img = new Image();
        img.src = materialImageUrl(m.texture);
      });
    });
    const edge = new Image();
    edge.src = materialImageUrl(COBBLED_EDGE_TEXTURE);
  }, []);

  const attachStream = useCallback(async () => {
    if (!videoRef.current || !cameraStream) return;
    videoRef.current.srcObject = cameraStream;
    videoRef.current.setAttribute('playsinline', 'true');
    videoRef.current.setAttribute('webkit-playsinline', 'true');
    try {
      await videoRef.current.play();
    } catch {
      // iOS may need a second attempt after layout.
      window.setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 100);
    }
  }, [cameraStream]);

  useEffect(() => {
    attachStream();
  }, [attachStream]);

  const selectMaterial = (id, catId) => {
    if (catId !== categoryId) setTileSize(100);
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

  const cameraSection = (
    <div className="mb-8">
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-3">Live camera preview</p>
      <p className="text-sm font-medium text-zinc-600 mb-4 leading-relaxed">
        Tap <span className="font-black text-black">OPEN CAMERA</span>, allow access when asked, then pick your stone or tile below — the overlay updates on your screen.
      </p>

      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-black aspect-[3/4] sm:aspect-[4/3] max-h-[65vh]">
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-zinc-900 text-center px-6 z-10">
            <Camera className="text-zinc-500" size={48} aria-hidden />
            <p className="text-xs font-bold text-zinc-400 max-w-xs leading-relaxed">
              Works on iPhone &amp; Android — Safari, Chrome, Samsung Internet, Firefox. Tap below and allow camera access.
            </p>
            <button
              type="button"
              onClick={onRequestCamera}
              className="px-8 py-4 bg-white text-black font-black text-[10px] tracking-[0.35em] rounded hover:bg-zinc-100 active:scale-95"
            >
              OPEN CAMERA
            </button>
            {cameraError && <p className="text-[10px] font-bold text-red-400 max-w-sm leading-relaxed">{cameraError}</p>}
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          disablePictureInPicture
          className={`absolute inset-0 h-full w-full object-cover ${cameraOn ? 'opacity-100' : 'opacity-0'}`}
        />

        {cameraOn && (
          <div
            className="absolute left-1/2 pointer-events-none"
            style={{
              bottom: '8%',
              width: `${previewWidth}%`,
              height: `${previewDepth}%`,
              transform: `translateX(-50%) perspective(500px) rotateX(52deg) rotateZ(${previewRotate}deg)`,
              transformOrigin: '50% 100%',
            }}
            aria-hidden
          >
            <div
              className="absolute inset-0 border-2 border-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.3)] overflow-hidden"
              style={{
                backgroundImage: `url("${materialSrc}")`,
                ...overlayTileStyle,
                opacity: 0.92,
              }}
            />
            {showCobbledEdge && (
              <>
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: '-9%',
                    height: '9%',
                    backgroundImage: `url("${edgeSrc}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.95,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: '-5%',
                    width: '5%',
                    backgroundImage: `url("${edgeSrc}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.95,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    right: '-5%',
                    width: '5%',
                    backgroundImage: `url("${edgeSrc}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.95,
                  }}
                />
                <div
                  className="absolute left-0 right-0"
                  style={{
                    bottom: '-7%',
                    height: '7%',
                    backgroundImage: `url("${edgeSrc}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.95,
                  }}
                />
              </>
            )}
          </div>
        )}

        {cameraOn && (
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-20">
            <span className="rounded bg-black/60 px-3 py-1.5 text-[9px] font-black tracking-widest text-white uppercase">
              {material.name}
            </span>
            <button
              type="button"
              onClick={onStopCamera}
              className="rounded bg-black/60 px-3 py-1.5 text-[9px] font-black tracking-widest text-white uppercase"
            >
              STOP
            </button>
          </div>
        )}
      </div>

      {cameraOn && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {tilePreset.repeat && (
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Maximize2 size={12} /> Tile size
              <input
                type="range"
                min={60}
                max={160}
                value={tileSize}
                onChange={(e) => {
                  setTileSize(Number(e.target.value));
                  setHasInteracted(true);
                }}
                className="flex-1 accent-black"
              />
            </label>
          )}
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
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
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
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
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <RotateCcw size={12} /> Rotate ({previewRotate}°)
            <input
              type="range"
              min={-180}
              max={180}
              step={5}
              value={previewRotate}
              onChange={(e) => {
                setPreviewRotate(Number(e.target.value));
                setHasInteracted(true);
              }}
              className="flex-1 accent-black"
            />
          </label>
          <p className="text-[9px] font-bold text-zinc-400 -mt-1">
            Spin 180° to lay tiles portrait or landscape on your view.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto text-left">
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 flex gap-3 items-start">
        <AlertTriangle className="shrink-0 text-zinc-500 mt-0.5" size={18} aria-hidden />
        <p className="text-[11px] font-bold leading-relaxed text-zinc-600 tracking-tight">{DISCLAIMER}</p>
      </div>

      {cameraSection}

      <div className="mb-8 pt-6 border-t border-zinc-200">
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">Choose category</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {VISUALISER_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectMaterial(c.materials[0].id, c.id)}
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

        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-3">Selected finish</p>
        <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          {!selectedPreviewFailed ? (
            <img
              src={materialSrc}
              alt={material.supplierLabel}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-32 sm:h-40 w-full object-cover"
              onError={() => setSelectedPreviewFailed(true)}
            />
          ) : (
            <div className="flex h-32 sm:h-40 items-center justify-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Preview unavailable
            </div>
          )}
          <div className="border-t border-zinc-200 bg-white px-4 py-3">
            <p className="text-sm font-black text-black">{material.name}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">{material.supplierLabel}</p>
            {showsEdgeInPhoto && (
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">
                Includes cobbled edge as shown in photo
              </p>
            )}
          </div>
        </div>

        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">Colours &amp; finishes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {category.materials.map((m) => (
            <MaterialThumb
              key={m.id}
              material={m}
              selected={materialId === m.id}
              onSelect={() => selectMaterial(m.id, category.id)}
            />
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-200 text-center">
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
          <p className="text-[10px] font-bold text-zinc-400 mt-4">Open the camera, then tap a material colour below.</p>
        )}
      </div>
    </div>
  );
}
