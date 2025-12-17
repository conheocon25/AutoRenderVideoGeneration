
import { GoogleGenAI } from "@google/genai";
import { Character, Scene, Job, InputType } from '../types';

export const fileToBase64 = (file: File): Promise<{data: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1];
      resolve({ data: result, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

// Added downloadFile utility function
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Added generateVideo function for Veo models
export const generateVideo = async (job: Job, onProgress: (msg: string) => void): Promise<string> => {
  onProgress("Initializing generation...");
  // Create a new GoogleGenAI instance right before making an API call for Veo models
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const videoOptions: any = {
    model: job.model,
    prompt: job.prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: job.aspectRatio
    }
  };

  if (job.inputType === InputType.IMAGE && job.imageFile) {
    const { data, mimeType } = await fileToBase64(job.imageFile);
    videoOptions.image = {
      imageBytes: data,
      mimeType: mimeType
    };
  }

  onProgress("Requesting video generation...");
  let operation = await ai.models.generateVideos(videoOptions);
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
    onProgress("Processing video generation (polling status)...");
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed: No download link returned from operation.");
  
  // The response body contains the MP4 bytes. Must append API key when fetching.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error(`Failed to fetch video from download link: ${response.statusText}`);
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateImageWithCharacters = async (
  scene: Scene, 
  allScenes: Scene[],
  characters: Character[],
  refinePrompt?: string,
  existingImageData?: string
): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedChars = characters.filter(c => scene.selectedCharacterIds.includes(c.id));
  const sceneIndex = allScenes.findIndex(s => s.id === scene.id);
  
  const prevScenes = allScenes.slice(Math.max(0, sceneIndex - 3), sceneIndex);
  
  // Find a reference image for style if this scene has no characters
  const styleReferenceScene = allScenes.find(s => s.resultUrl && s.selectedCharacterIds.length > 0);

  const parts: any[] = [];

  // 1. CHARACTER CONSISTENCY (Physical Appearance)
  if (selectedChars.length > 0) {
    selectedChars.forEach(char => {
      char.images.forEach(img => {
        parts.push({
          inlineData: { mimeType: img.mimeType, data: img.data },
        });
      });
      parts.push({ text: `Character ${char.name} Identity: ${char.styleDescription}` });
    });
  } 

  // 2. STYLE CONSISTENCY (Artistic Style from generated images)
  if (styleReferenceScene?.resultUrl) {
    const response = await fetch(styleReferenceScene.resultUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    parts.push({
      inlineData: { mimeType: 'image/png', data: base64 },
    });
    parts.push({ text: "STYLE REFERENCE: Maintain the exact artistic style, brushwork, lighting, and color palette from this previous image." });
  }

  // 3. REFINEMENT
  if (existingImageData) {
    parts.push({
      inlineData: { mimeType: 'image/png', data: existingImageData.split(',')[1] || existingImageData },
    });
  }

  // 4. CONTEXT & PROMPT
  const characterNames = selectedChars.map(c => c.name).join(', ');
  const characterDirective = selectedChars.length > 0 
    ? `Ensure ${characterNames} appear exactly as the references. Integrate them naturally.`
    : `DO NOT include any of the main characters in this shot unless explicitly mentioned. Focus on the environment.`;

  const contextDirective = `
    STORY CONTEXT:
    Previous actions: ${prevScenes.map(s => s.script).join(' -> ')}
    Current scene: "${scene.script}"
    
    ENVIRONMENTAL CONSISTENCY:
    If the setting is the same as the previous scenes, maintain all architectural and environmental details. 
    However, use a NEW camera angle and composition to keep it visually diverse.
  `;

  const promptText = `
    ${characterDirective}
    ${contextDirective}
    PROMPT: "${refinePrompt || scene.prompt}".
    RULES: Cinematic quality, consistent lighting/color with style reference. NO TEXT or labels.
  `;
  
  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
  });

  let base64Result = '';
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Result = part.inlineData.data;
        break;
      }
    }
  }

  if (!base64Result) throw new Error("API returned no image.");

  return `data:image/png;base64,${base64Result}`;
};
