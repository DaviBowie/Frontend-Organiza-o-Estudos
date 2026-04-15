import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(date: string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isExternalLink(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function isYouTubeLink(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  )?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  in_progress: 'Em progresso',
  complete: 'Completo',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-700 text-slate-300',
  in_progress: 'bg-amber-900/40 text-amber-400',
  complete: 'bg-teal-900/40 text-teal-400',
};

export const MATERIAL_LABELS: Record<string, string> = {
  docx: 'Documento',
  audio: 'Áudio',
  video: 'Vídeo',
  infographic: 'Infográfico',
  slides: 'Slides',
};

export const MATERIAL_ICONS: Record<string, string> = {
  docx: '📄',
  audio: '🔊',
  video: '🎬',
  infographic: '🖼️',
  slides: '📊',
};
