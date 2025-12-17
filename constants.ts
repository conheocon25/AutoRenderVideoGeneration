
import { AspectRatio, InputType, Model } from './types';

export const MAX_CONCURRENT_JOBS = 4;

// Fix: Updated to currently supported and recommended models
export const MODELS: { value: Model; label: string }[] = [
  { value: 'veo-3.1-fast-generate-preview', label: 'Veo Fast (Tốc độ cao)' },
  { value: 'veo-3.1-generate-preview', label: 'Veo HQ (Chất lượng cao)' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3 (Standard)' },
  { value: '3:4', label: '3:4 (Vertical)' },
];

export const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: InputType.TEXT, label: 'From Text' },
  { value: InputType.IMAGE, label: 'From Image' },
];
