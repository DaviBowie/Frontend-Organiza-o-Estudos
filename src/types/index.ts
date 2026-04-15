export type StudyStatus = 'draft' | 'in_progress' | 'complete';
export type MaterialType = 'docx' | 'audio' | 'video' | 'infographic' | 'slides';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  study_id: string;
  type: MaterialType;
  file_url: string | null;
  external_link: string | null;
  file_name: string | null;
  file_size: number | null;
  order_index: number;
  created_at: string;
}

export interface Study {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: StudyStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  materials?: StudyMaterial[];
}

export interface StudyFormData {
  title: string;
  description: string;
  category_id: string;
  status: StudyStatus;
  tags: string;
  docx_file?: File | null;
  docx_link?: string;
  audio_file?: File | null;
  audio_link?: string;
  video_file?: File | null;
  video_link?: string;
  infographic_file?: File | null;
  infographic_link?: string;
  slides_file?: File | null;
  slides_link?: string;
}

export interface DashboardStats {
  totalStudies: number;
  totalMaterials: number;
  totalCategories: number;
  studiesByStatus: {
    draft: number;
    in_progress: number;
    complete: number;
  };
}
