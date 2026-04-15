import { useNavigate } from 'react-router-dom';
import { type Study } from '../../types';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  formatRelativeDate,
  STATUS_LABELS,
  STATUS_COLORS,
  MATERIAL_ICONS,
} from '../../lib/utils';
import { cn } from '../../lib/utils';

interface StudyCardProps {
  study: Study;
}

const MATERIAL_TYPES = ['docx', 'audio', 'video', 'infographic', 'slides'] as const;

export function StudyCard({ study }: StudyCardProps) {
  const navigate = useNavigate();

  const availableMaterials = MATERIAL_TYPES.filter((type) =>
    study.materials?.some(
      (m) => m.type === type && (m.file_url || m.external_link)
    )
  );

  return (
    <Card
      hover
      onClick={() => navigate(`/studies/${study.id}`)}
      className="group flex flex-col"
    >
      <CardContent className="flex-1">
        {/* Category + Status */}
        <div className="flex items-center gap-2 mb-3">
          {study.category && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: study.category.color + '22',
                color: study.category.color,
                border: `1px solid ${study.category.color}44`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: study.category.color }}
              />
              {study.category.name}
            </span>
          )}
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              STATUS_COLORS[study.status]
            )}
          >
            {STATUS_LABELS[study.status]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
          {study.title}
        </h3>

        {/* Description */}
        {study.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
            {study.description}
          </p>
        )}

        {/* Tags */}
        {study.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {study.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
            {study.tags.length > 3 && (
              <Badge variant="default">+{study.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {/* Materials available */}
        <div className="flex gap-1">
          {MATERIAL_TYPES.map((type) => {
            const available = availableMaterials.includes(type);
            return (
              <span
                key={type}
                className={cn(
                  'text-base transition-all',
                  available ? 'opacity-100' : 'opacity-20 grayscale'
                )}
                title={available ? `${type} disponível` : `${type} não disponível`}
              >
                {MATERIAL_ICONS[type]}
              </span>
            );
          })}
        </div>

        <span className="text-xs text-slate-600">
          {formatRelativeDate(study.updated_at)}
        </span>
      </CardFooter>
    </Card>
  );
}
