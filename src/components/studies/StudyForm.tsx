import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { type Study, type Category, type StudyStatus, type MaterialType } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

interface MaterialField {
  type: MaterialType;
  label: string;
  icon: string;
  accept: string;
  acceptLabel: string;
}

const MATERIAL_FIELDS: MaterialField[] = [
  { type: 'docx', label: 'Documento Original', icon: '📄', accept: '.docx,.doc', acceptLabel: '.docx, .doc' },
  { type: 'audio', label: 'Áudio Explicativo', icon: '🔊', accept: '.mp3,.wav,.ogg,.m4a', acceptLabel: '.mp3, .wav, .m4a' },
  { type: 'video', label: 'Vídeo Explicativo', icon: '🎬', accept: '.mp4,.webm,.mov', acceptLabel: '.mp4, link YouTube/Drive' },
  { type: 'infographic', label: 'Infográfico', icon: '🖼️', accept: '.png,.jpg,.jpeg,.pdf', acceptLabel: '.png, .jpg, .pdf' },
  { type: 'slides', label: 'Slides', icon: '📊', accept: '.pptx,.pdf', acceptLabel: '.pptx, .pdf, ou link' },
];

interface StudyFormState {
  title: string;
  description: string;
  category_id: string;
  status: StudyStatus;
  tags: string;
  materials: Record<MaterialType, { file: File | null; link: string }>;
}

interface StudyFormProps {
  study?: Study;
  categories: Category[];
  onSubmit: (data: StudyFormState) => Promise<void>;
  loading?: boolean;
}

function MaterialUploadField({
  field,
  value,
  onChange,
}: {
  field: MaterialField;
  value: { file: File | null; link: string };
  onChange: (val: { file: File | null; link: string }) => void;
}) {
  const [mode, setMode] = useState<'file' | 'link'>(
    value.link && !value.file ? 'link' : 'file'
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange({ file: accepted[0], link: '' });
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { '*/*': field.accept.split(',') },
    maxFiles: 1,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <span>{field.icon}</span>
          {field.label}
        </label>
        <div className="flex text-xs gap-1 bg-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => { setMode('file'); onChange({ file: null, link: '' }); }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
              mode === 'file' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Upload size={11} /> Arquivo
          </button>
          <button
            type="button"
            onClick={() => { setMode('link'); onChange({ file: null, link: '' }); }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
              mode === 'link' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <LinkIcon size={11} /> Link
          </button>
        </div>
      </div>

      {mode === 'file' ? (
        <div>
          {value.file ? (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg">
              <span className="text-xs text-slate-300 flex-1 truncate">{value.file.name}</span>
              <button
                type="button"
                onClick={() => onChange({ file: null, link: '' })}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                'border border-dashed border-slate-700 rounded-lg px-4 py-5 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-amber-500 bg-amber-500/5' : 'hover:border-slate-500 hover:bg-slate-800/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload size={18} className="mx-auto text-slate-600 mb-1" />
              <p className="text-xs text-slate-500">
                Arraste ou clique — {field.acceptLabel}
              </p>
            </div>
          )}
        </div>
      ) : (
        <input
          type="url"
          placeholder="https://..."
          value={value.link}
          onChange={(e) => onChange({ file: null, link: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
        />
      )}
    </div>
  );
}

export function StudyForm({ study, categories, onSubmit, loading }: StudyFormProps) {
  const [form, setForm] = useState<StudyFormState>({
    title: study?.title ?? '',
    description: study?.description ?? '',
    category_id: study?.category_id ?? '',
    status: study?.status ?? 'draft',
    tags: study?.tags.join(', ') ?? '',
    materials: {
      docx: { file: null, link: '' },
      audio: { file: null, link: '' },
      video: { file: null, link: '' },
      infographic: { file: null, link: '' },
      slides: { file: null, link: '' },
    },
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function validate() {
    const errs: Partial<Record<string, string>> = {};
    if (!form.title.trim()) errs.title = 'Título é obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Informações Básicas
        </h3>
        <Input
          label="Título do Estudo *"
          placeholder="Ex: Introdução ao Machine Learning"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
        />
        <Textarea
          label="Descrição"
          placeholder="Breve descrição sobre o conteúdo deste estudo..."
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Categoria"
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as StudyStatus }))
            }
          >
            <option value="draft">Rascunho</option>
            <option value="in_progress">Em progresso</option>
            <option value="complete">Completo</option>
          </Select>
        </div>
        <Input
          label="Tags"
          placeholder="machine learning, IA, python (separadas por vírgula)"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          hint="Separe as tags com vírgula"
        />
      </div>

      {/* Materials */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Materiais do Estudo
        </h3>
        <div className="space-y-3">
          {MATERIAL_FIELDS.map((field) => (
            <MaterialUploadField
              key={field.type}
              field={field}
              value={form.materials[field.type]}
              onChange={(val) =>
                setForm((f) => ({
                  ...f,
                  materials: { ...f.materials, [field.type]: val },
                }))
              }
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading} size="lg">
          {study ? 'Salvar alterações' : 'Criar estudo'}
        </Button>
      </div>
    </form>
  );
}
