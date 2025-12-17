
export enum JobStatus {
  PENDING = 'Pending',
  RUNNING = 'Running',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

// Added InputType enum
export enum InputType {
  TEXT = 'Text',
  IMAGE = 'Image',
}

// Added Model type for supported Veo models
export type Model = 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview';

// Added AspectRatio type for supported video ratios
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

// Added Job interface for video generation tasks
export interface Job {
  id: string;
  status: JobStatus;
  prompt: string;
  inputType: InputType;
  model: Model;
  aspectRatio: AspectRatio;
  outputCount: number;
  imageFile?: File;
  referenceCharacterNames?: string[];
  progressMessage?: string;
  resultUrl?: string;
  error?: string;
}

export interface CharacterImage {
  id: string;
  url: string;
  data: string; // base64
  mimeType: string;
}

export interface Character {
  id: string;
  name: string;
  styleDescription: string;
  images: CharacterImage[];
  isDefault?: boolean;
  // Properties required by components like JobForm and CharacterReference
  isSelected?: boolean;
  imageFile?: File;
  imageUrl?: string;
  prompt?: string;
  isGeneratingPrompt?: boolean;
}

export interface Scene {
  id: string;
  index: number;
  script: string;
  prompt: string;
  selectedCharacterIds: string[]; // Empty array means "None"
  status: JobStatus;
  resultUrl?: string;
  error?: string;
  isGenerating?: boolean;
}
