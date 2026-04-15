import { useState, useRef, useEffect } from 'react';
import { type StudyMaterial } from '../../types';
import {
  formatFileSize,
  isYouTubeLink,
  getYouTubeEmbedUrl,
  MATERIAL_LABELS,
  MATERIAL_ICONS,
} from '../../lib/utils';
import {
  Download,
  ExternalLink,
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  Presentation,
} from 'lucide-react';

interface MaterialPlayerProps {
  material: StudyMaterial;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRename?: (name: string) => Promise<void>;
}

// Detect if a URL is a Google Slides or Canva presentation
function getSlidesEmbedUrl(url: string): string | null {
  // Google Slides: https://docs.google.com/presentation/d/ID/...
  const gSlidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([^/]+)/);
  if (gSlidesMatch) {
    return `https://docs.google.com/presentation/d/${gSlidesMatch[1]}/embed?start=false&loop=false`;
  }
  // Canva: https://www.canva.com/design/ID/...
  if (url.includes('canva.com/design/')) {
    return url.includes('/view') ? url.replace('/view', '/embed') : `${url}/embed`;
  }
  return null;
}

function isPdf(url: string): boolean {
  return url.split('?')[0].toLowerCase().endsWith('.pdf');
}

function isPptx(url: string): boolean {
  return url.split('?')[0].toLowerCase().endsWith('.pptx') || url.split('?')[0].toLowerCase().endsWith('.ppt');
}

// Lightbox for infographic
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Infográfico"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function MaterialPlayer({
  material,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRename,
}: MaterialPlayerProps) {
  const [imgError, setImgError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(material.file_name ?? MATERIAL_LABELS[material.type]);
  const [saving, setSaving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [slidesOpen, setSlidesOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const url = material.file_url || material.external_link || '';

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function handleSaveName() {
    if (!nameValue.trim() || !onRename) { setEditing(false); return; }
    setSaving(true);
    await onRename(nameValue.trim());
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setNameValue(material.file_name ?? MATERIAL_LABELS[material.type]);
      setEditing(false);
    }
  }

  const renderPlayer = () => {
    if (!url) return null;

    switch (material.type) {
      case 'audio':
        return (
          <audio controls className="w-full mt-3">
            <source src={url} />
            Seu navegador não suporta áudio.
          </audio>
        );

      case 'video':
        if (isYouTubeLink(url)) {
          return (
            <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getYouTubeEmbedUrl(url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <video controls className="w-full mt-3 rounded-lg bg-black">
            <source src={url} />
            Seu navegador não suporta vídeo.
          </video>
        );

      case 'infographic':
        if (imgError) return null;
        return (
          <div
            className="mt-3 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 cursor-zoom-in group/img relative"
            onClick={() => setLightboxOpen(true)}
            title="Clique para ampliar"
          >
            <img
              src={url}
              alt="Infográfico"
              className="w-full object-contain max-h-72 transition-transform duration-200 group-hover/img:scale-[1.02]"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/30 transition-colors">
              <ZoomIn
                size={28}
                className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg"
              />
            </div>
          </div>
        );

      case 'slides': {
        if (!slidesOpen) return null;

        const embedUrl = getSlidesEmbedUrl(url);

        // Google Slides or Canva embed
        if (embedUrl) {
          return (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
              <iframe
                src={embedUrl}
                className="w-full"
                style={{ height: '420px' }}
                allowFullScreen
                title="Slides"
              />
            </div>
          );
        }

        // PDF embed
        if (isPdf(url)) {
          return (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
              <iframe
                src={url}
                className="w-full"
                style={{ height: '480px' }}
                title="PDF"
              />
            </div>
          );
        }

        // PPTX via Google Docs Viewer
        if (isPptx(url)) {
          return (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                className="w-full"
                style={{ height: '480px' }}
                title="Apresentação"
              />
            </div>
          );
        }

        // Fallback — try to embed directly
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
            <iframe
              src={url}
              className="w-full"
              style={{ height: '480px' }}
              title="Slides"
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  const showSlidesToggle = material.type === 'slides' && !!url;

  return (
    <>
      {lightboxOpen && <Lightbox src={url} onClose={() => setLightboxOpen(false)} />}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2">

          {/* Reorder buttons */}
          {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Mover para cima"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Mover para baixo"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}

          {/* Icon + name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0">{MATERIAL_ICONS[material.type]}</span>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/60 min-w-0"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="p-1 text-teal-400 hover:bg-slate-700 rounded transition-colors"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setNameValue(material.file_name ?? MATERIAL_LABELS[material.type]);
                      setEditing(false);
                    }}
                    className="p-1 text-slate-500 hover:bg-slate-700 rounded transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 group/name">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {material.file_name ?? MATERIAL_LABELS[material.type]}
                  </p>
                  {onRename && (
                    <button
                      onClick={() => setEditing(true)}
                      className="opacity-0 group-hover/name:opacity-100 p-1 text-slate-600 hover:text-slate-300 rounded transition-all"
                      title="Renomear"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                </div>
              )}
              {material.file_size != null && (
                <p className="text-xs text-slate-500">{formatFileSize(material.file_size)}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Slides toggle */}
            {showSlidesToggle && (
              <button
                onClick={() => setSlidesOpen((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${
                  slidesOpen
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700'
                }`}
                title={slidesOpen ? 'Ocultar slides' : 'Visualizar slides'}
              >
                <Presentation size={14} />
              </button>
            )}

            {material.file_url && (
              <a
                href={material.file_url}
                download={material.file_name || true}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                title="Baixar"
              >
                <Download size={14} />
              </a>
            )}
            {material.external_link && (
              <a
                href={material.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                title="Abrir link"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {renderPlayer()}
      </div>
    </>
  );
}
