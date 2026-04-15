import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Plus,
  X,
  Link as LinkIcon,
  PlayCircle,
  FileText,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import { useCategories } from '../hooks/useCategories';
import { createStudy, saveMaterial } from '../hooks/useStudies';
import { type StudyStatus } from '../types';
import { cn } from '../lib/utils';
import {
  nlmCreateNotebook,
  nlmAddUrlSource,
  nlmAddYouTubeSource,
  nlmAddTextSource,
  nlmAddFileSource,
  nlmGenerateAudio,
  nlmGenerateVideo,
  nlmGenerateSlideDeck,
  nlmGenerateInfographic,
  nlmDownloadAudio,
  nlmDownloadVideo,
  nlmDownloadSlideDeck,
  nlmDownloadInfographic,
  nlmFullUrl,
} from '../lib/notebooklmApi';

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceType = 'url' | 'youtube' | 'text' | 'file';

interface Source {
  id: string;
  type: SourceType;
  label: string;
  url?: string;
  title?: string;
  content?: string;
  file?: File;
}

type ArtifactKey = 'audio' | 'video' | 'slides' | 'infographic';

interface ArtifactOption {
  key: ArtifactKey;
  label: string;
  icon: string;
  description: string;
}

const ARTIFACTS: ArtifactOption[] = [
  { key: 'audio', label: 'Áudio (Podcast)', icon: '🔊', description: 'Conversa explicativa em formato podcast' },
  { key: 'video', label: 'Vídeo Explicativo', icon: '🎬', description: 'Vídeo animado sobre o conteúdo' },
  { key: 'slides', label: 'Slides', icon: '📊', description: 'Apresentação de slides detalhada' },
  { key: 'infographic', label: 'Infográfico', icon: '🖼️', description: 'Visualização visual do conteúdo' },
];

// ── Step indicator ────────────────────────────────────────────────────────────

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface Step {
  label: string;
  status: StepStatus;
}

function StepItem({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-3">
      {step.status === 'done' && <CheckCircle size={16} className="text-green-400 shrink-0" />}
      {step.status === 'running' && <Loader2 size={16} className="text-amber-400 animate-spin shrink-0" />}
      {step.status === 'error' && <AlertCircle size={16} className="text-red-400 shrink-0" />}
      {step.status === 'pending' && <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />}
      <span
        className={cn('text-sm', {
          'text-green-400': step.status === 'done',
          'text-amber-300': step.status === 'running',
          'text-red-400': step.status === 'error',
          'text-slate-500': step.status === 'pending',
        })}
      >
        {step.label}
      </span>
    </div>
  );
}

// ── Source input ──────────────────────────────────────────────────────────────

function SourceInput({ onAdd }: { onAdd: (s: Source) => void }) {
  const [tab, setTab] = useState<SourceType>('url');
  const [url, setUrl] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  function handleAdd() {
    if (tab === 'url' && url.trim()) {
      onAdd({ id: crypto.randomUUID(), type: 'url', label: url.trim(), url: url.trim() });
      setUrl('');
    } else if (tab === 'youtube' && ytUrl.trim()) {
      onAdd({ id: crypto.randomUUID(), type: 'youtube', label: ytUrl.trim(), url: ytUrl.trim() });
      setYtUrl('');
    } else if (tab === 'text' && textTitle.trim() && textContent.trim()) {
      onAdd({ id: crypto.randomUUID(), type: 'text', label: textTitle.trim(), title: textTitle.trim(), content: textContent.trim() });
      setTextTitle('');
      setTextContent('');
    } else if (tab === 'file' && file) {
      onAdd({ id: crypto.randomUUID(), type: 'file', label: file.name, file });
      setFile(null);
    }
  }

  const tabs: { type: SourceType; label: string; icon: React.ReactNode }[] = [
    { type: 'url', label: 'URL', icon: <LinkIcon size={13} /> },
    { type: 'youtube', label: 'YouTube', icon: <PlayCircle size={13} /> },
    { type: 'text', label: 'Texto', icon: <FileText size={13} /> },
    { type: 'file', label: 'Arquivo', icon: <Upload size={13} /> },
  ];

  const canAdd =
    (tab === 'url' && url.trim()) ||
    (tab === 'youtube' && ytUrl.trim()) ||
    (tab === 'text' && textTitle.trim() && textContent.trim()) ||
    (tab === 'file' && file);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setTab(t.type)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              tab === t.type
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      {tab === 'url' && (
        <input
          type="url"
          placeholder="https://exemplo.com/artigo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canAdd && handleAdd()}
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
        />
      )}

      {tab === 'youtube' && (
        <input
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canAdd && handleAdd()}
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
        />
      )}

      {tab === 'text' && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Título do texto"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
          />
          <textarea
            placeholder="Cole aqui o conteúdo do texto..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 resize-none"
          />
        </div>
      )}

      {tab === 'file' && (
        <div>
          {file ? (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg">
              <span className="text-xs text-slate-300 flex-1 truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                'border border-dashed border-slate-700 rounded-lg px-4 py-6 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-amber-500 bg-amber-500/5' : 'hover:border-slate-500 hover:bg-slate-800/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload size={20} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">Arraste ou clique — PDF, DOCX, TXT, MD</p>
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={!canAdd}
      >
        <Plus size={14} />
        Adicionar fonte
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GenerateStudy() {
  const navigate = useNavigate();
  const { categories } = useCategories();

  // Study metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<StudyStatus>('draft');
  const [tags, setTags] = useState('');

  // Sources
  const [sources, setSources] = useState<Source[]>([]);

  // Artifacts to generate
  const [selectedArtifacts, setSelectedArtifacts] = useState<Set<ArtifactKey>>(
    new Set(['audio', 'slides'])
  );

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState('');

  function toggleArtifact(key: ArtifactKey) {
    setSelectedArtifacts((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  function setStepStatus(index: number, status: StepStatus) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, status } : s)));
  }

  async function handleGenerate() {
    if (!title.trim()) { setError('O título é obrigatório'); return; }
    if (sources.length === 0) { setError('Adicione pelo menos uma fonte'); return; }
    if (selectedArtifacts.size === 0) { setError('Selecione pelo menos um artefato para gerar'); return; }

    setError('');
    setGenerating(true);

    const artifactList = [...selectedArtifacts];

    const initialSteps: Step[] = [
      { label: 'Criando estudo', status: 'pending' },
      { label: 'Criando notebook no NotebookLM', status: 'pending' },
      ...sources.map((s, i) => ({ label: `Adicionando fonte ${i + 1}: ${s.label.slice(0, 40)}`, status: 'pending' as StepStatus })),
      ...artifactList.map((a) => ({ label: `Gerando ${ARTIFACTS.find((x) => x.key === a)!.label}`, status: 'pending' as StepStatus })),
      ...artifactList.map((a) => ({ label: `Baixando ${ARTIFACTS.find((x) => x.key === a)!.label}`, status: 'pending' as StepStatus })),
      { label: 'Salvando materiais', status: 'pending' },
    ];

    setSteps(initialSteps);

    let stepIdx = 0;

    try {
      // 1. Create study in Supabase
      setStepStatus(stepIdx, 'running');
      const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { id: studyId, error: createErr } = await createStudy(
        title.trim(), description.trim(), categoryId || null, status, parsedTags
      );
      if (createErr || !studyId) throw new Error(createErr ?? 'Erro ao criar estudo');
      setStepStatus(stepIdx, 'done');
      stepIdx++;

      // 2. Create NotebookLM notebook
      setStepStatus(stepIdx, 'running');
      const notebook = await nlmCreateNotebook(title.trim());
      const notebookId = notebook.id;
      setStepStatus(stepIdx, 'done');
      stepIdx++;

      // 3. Add sources
      for (const source of sources) {
        setStepStatus(stepIdx, 'running');
        if (source.type === 'url') await nlmAddUrlSource(notebookId, source.url!);
        else if (source.type === 'youtube') await nlmAddYouTubeSource(notebookId, source.url!);
        else if (source.type === 'text') await nlmAddTextSource(notebookId, source.title!, source.content!);
        else if (source.type === 'file') await nlmAddFileSource(notebookId, source.file!);
        setStepStatus(stepIdx, 'done');
        stepIdx++;
      }

      // 4. Generate artifacts
      for (const artifact of artifactList) {
        setStepStatus(stepIdx, 'running');
        if (artifact === 'audio') await nlmGenerateAudio(notebookId);
        else if (artifact === 'video') await nlmGenerateVideo(notebookId);
        else if (artifact === 'slides') await nlmGenerateSlideDeck(notebookId);
        else if (artifact === 'infographic') await nlmGenerateInfographic(notebookId);
        setStepStatus(stepIdx, 'done');
        stepIdx++;
      }

      // 5. Download artifacts
      const downloads: Record<ArtifactKey, string> = {} as Record<ArtifactKey, string>;
      for (const artifact of artifactList) {
        setStepStatus(stepIdx, 'running');
        let result;
        if (artifact === 'audio') result = await nlmDownloadAudio(notebookId);
        else if (artifact === 'video') result = await nlmDownloadVideo(notebookId);
        else if (artifact === 'slides') result = await nlmDownloadSlideDeck(notebookId);
        else result = await nlmDownloadInfographic(notebookId);
        downloads[artifact] = nlmFullUrl(result.url);
        setStepStatus(stepIdx, 'done');
        stepIdx++;
      }

      // 6. Save materials to Supabase
      setStepStatus(stepIdx, 'running');
      const materialMap: Record<ArtifactKey, 'audio' | 'video' | 'slides' | 'infographic'> = {
        audio: 'audio',
        video: 'video',
        slides: 'slides',
        infographic: 'infographic',
      };
      await Promise.all(
        artifactList.map((artifact) =>
          saveMaterial(studyId, materialMap[artifact], null, downloads[artifact], artifact, null)
        )
      );
      setStepStatus(stepIdx, 'done');

      // Navigate to the new study
      setTimeout(() => navigate(`/studies/${studyId}`), 800);
    } catch (err: unknown) {
      setStepStatus(stepIdx, 'error');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setGenerating(false);
    }
  }

  const sourceTypeIcon: Record<SourceType, React.ReactNode> = {
    url: <LinkIcon size={12} />,
    youtube: <PlayCircle size={12} />,
    text: <FileText size={12} />,
    file: <Upload size={12} />,
  };

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Voltar
      </button>

      <Header
        title="Gerar Estudo com NotebookLM"
        subtitle="Adicione fontes e o NotebookLM gera os materiais automaticamente"
      />

      {generating ? (
        /* ── Progress view ── */
        <div className="max-w-lg mt-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <p className="text-sm font-medium text-slate-300 mb-4">Gerando seu estudo...</p>
            {steps.map((step, i) => (
              <StepItem key={i} step={step} />
            ))}
          </div>
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setGenerating(false)}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ── Form view ── */
        <div className="max-w-2xl space-y-8">
          {error && (
            <div className="px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Fontes */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Fontes de Conteúdo
            </h3>
            <p className="text-xs text-slate-500">
              Adicione URLs, vídeos do YouTube, textos ou arquivos que o NotebookLM usará para gerar os materiais.
            </p>
            <SourceInput onAdd={(s) => setSources((prev) => [...prev, s])} />
            {sources.length > 0 && (
              <div className="space-y-2">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg"
                  >
                    <span className="text-slate-500">{sourceTypeIcon[s.type]}</span>
                    <span className="flex-1 text-xs text-slate-300 truncate">{s.label}</span>
                    <button
                      type="button"
                      onClick={() => removeSource(s.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Artefatos */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Materiais a Gerar
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ARTIFACTS.map((a) => {
                const selected = selectedArtifacts.has(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleArtifact(a.key)}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                      selected
                        ? 'border-amber-500/50 bg-amber-500/10 text-slate-100'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    )}
                  >
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <p className="text-sm font-medium leading-tight">{a.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Informações do estudo */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Informações do Estudo
            </h3>
            <Input
              label="Título *"
              placeholder="Ex: Introdução ao Machine Learning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Descrição"
              placeholder="Breve descrição sobre o conteúdo..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Categoria"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
                value={status}
                onChange={(e) => setStatus(e.target.value as StudyStatus)}
              >
                <option value="draft">Rascunho</option>
                <option value="in_progress">Em progresso</option>
                <option value="complete">Completo</option>
              </Select>
            </div>
            <Input
              label="Tags"
              placeholder="machine learning, IA, python"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              hint="Separadas por vírgula"
            />
          </section>

          <div className="flex justify-end pt-2">
            <Button size="lg" onClick={handleGenerate}>
              Gerar Estudo
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
