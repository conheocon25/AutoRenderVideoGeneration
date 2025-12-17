
import React, { useState, useRef } from 'react';
import { Job, JobStatus, InputType, Model, AspectRatio, Character } from '../types';
import { MODELS, ASPECT_RATIOS, INPUT_TYPES } from '../constants';
import { UploadIcon } from './icons';

interface JobFormProps {
  characters: Character[];
  onAddJob: (job: Omit<Job, 'id' | 'status'>) => void;
  onAddMultipleJobs: (jobs: Omit<Job, 'id' | 'status'>[]) => void;
  contextPrompt: string;
  isCreativeContext: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ characters, onAddJob, onAddMultipleJobs, contextPrompt, isCreativeContext }) => {
  const [prompt, setPrompt] = useState<string>('A neon hologram of a cat driving at top speed');
  const [inputType, setInputType] = useState<InputType>(InputType.TEXT);
  // Fix: Set default model to a valid supported model
  const [model, setModel] = useState<Model>('veo-3.1-fast-generate-preview');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [outputCount, setOutputCount] = useState<number>(1);
  const [csvFile, setCsvFile] = useState<File | undefined>();
  const [csvColumn, setCsvColumn] = useState<string>('prompt');

  const getCharacterContext = () => {
    const allDefinedCharacters = characters.filter(c => (c.images && c.images.length > 0) && c.name);
    const characterContext = allDefinedCharacters
      .map(c => {
          if (c.styleDescription && c.styleDescription.trim() !== '') {
              return `${c.name}: ${c.styleDescription.trim()}`;
          }
          return c.name;
      })
      .join('; ');
    return characterContext;
  };

  const buildFinalPrompt = (basePrompt: string) => {
    const characterContext = getCharacterContext();
    let contextParts = [];

    if (characterContext) {
        contextParts.push(`Reference characters: [${characterContext}]`);
    }
    if (contextPrompt.trim()) {
        let contextDescription = `Scene context: [${contextPrompt.trim()}]`;
        if (isCreativeContext) {
            contextDescription += ' (AI should use this context image as inspiration to create new contexts from different perspectives, suitable for the prompt).';
        }
        contextParts.push(contextDescription);
    }

    if (contextParts.length > 0) {
        return `${contextParts.join('. ')}. \n\n${basePrompt}`;
    }
    return basePrompt;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Prompt cannot be empty.');
      return;
    }
    
    // Fix: Updated check for selected character with images
    const selectedCharacter = characters.find(c => c.isSelected && c.images && c.images.length > 0);
    if (inputType === InputType.IMAGE && !selectedCharacter) {
        alert('For Image-to-Video, please select a reference character with an uploaded image.');
        return;
    }
    
    const finalPrompt = buildFinalPrompt(prompt);
    const allDefinedCharacters = characters.filter(c => c.images && c.images.length > 0);

    onAddJob({
      prompt: finalPrompt,
      inputType,
      model,
      aspectRatio,
      outputCount,
      imageFile: inputType === InputType.IMAGE ? selectedCharacter?.imageFile : undefined,
      referenceCharacterNames: allDefinedCharacters.map(c => c.name),
    });
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
    e.target.value = '';
  };

  const processCsvFile = () => {
    if (!csvFile) {
        alert('Please select a CSV file to upload.');
        return;
    }
    if (!csvColumn.trim()) {
      alert("Please specify the 'Prompt Column Name' from your CSV.");
      return;
    }

    const allDefinedCharacters = characters.filter(c => c.images && c.images.length > 0);
    const selectedCharacter = characters.find(c => c.isSelected && c.images && c.images.length > 0);

    if (inputType === InputType.IMAGE && !selectedCharacter) {
        alert('For Image-to-Video from CSV, please select a reference character with an uploaded image first. All jobs from the CSV will use this character.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
      if (rows.length < 2) {
        alert('CSV file must have a header and at least one data row.');
        return;
      }
      
      const header = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const promptIndex = header.indexOf(csvColumn);

      if (promptIndex === -1) {
        alert(`Column '${csvColumn}' not found in CSV header. Found: ${header.join(', ')}`);
        return;
      }

      const newJobs = rows.slice(1).map((row): Omit<Job, 'id' | 'status'> | null => {
        const columns = row.split(',').map(c => c.trim().replace(/"/g, ''));
        const promptText = columns[promptIndex]?.trim();
        
        if (!promptText) {
            return null;
        }
        
        const finalPrompt = buildFinalPrompt(promptText);

        return {
          prompt: finalPrompt,
          inputType, model, aspectRatio, outputCount, 
          imageFile: inputType === InputType.IMAGE ? selectedCharacter?.imageFile : undefined,
          referenceCharacterNames: allDefinedCharacters.map(c => c.name),
        };
      }).filter((job): job is Omit<Job, 'id' | 'status'> => job !== null);
      
      if(newJobs.length > 0) {
        onAddMultipleJobs(newJobs);
        alert(`${newJobs.length} jobs added to the queue.`);
      } else {
        alert('No valid jobs with non-empty prompts found in the specified column.');
      }
      
      setCsvFile(undefined);
    };
    reader.readAsText(csvFile);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Add từng Job Promt thủ công</h2>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">Prompt</label>
          <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="inputType" className="block text-sm font-medium text-slate-300 mb-1">Input Type</label>
            <select id="inputType" value={inputType} onChange={e => setInputType(e.target.value as InputType)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
              {INPUT_TYPES.map(it => <option key={it.value} value={it.value}>{it.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-1">Model</label>
            <select id="model" value={model} onChange={e => setModel(e.target.value as Model)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
            <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
              {ASPECT_RATIOS.map(ar => <option key={ar.value} value={ar.value}>{ar.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="outputCount" className="block text-sm font-medium text-slate-300 mb-1">Outputs</label>
            <input type="number" id="outputCount" value={outputCount} onChange={e => setOutputCount(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
        </div>
        {inputType === InputType.IMAGE && (
          <div className="bg-slate-900/50 p-3 rounded-md text-sm text-slate-300 text-center">
            The selected reference character's image will be used as the input.
          </div>
        )}
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">Add to Queue</button>
      </form>

      <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-4">Add danh sách Job từ file CSV (excel) </h2>
          <div className='mb-4'>
            <label htmlFor="csvColumn" className="block text-sm font-medium text-slate-300 mb-1">Cột chứ Prompt Nội dung Video cần tạo</label>
            <input type="text" id="csvColumn" value={csvColumn} onChange={e => setCsvColumn(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g., prompt_text" />
          </div>
          <div className="flex items-center justify-center w-full mb-4">
            <label htmlFor="csv-file-upload" className="flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadIcon />
                    {csvFile ? (
                        <>
                            <p className="font-semibold text-slate-300 break-all">{csvFile.name}</p>
                            <p className="text-xs text-slate-500 mt-1">Click again to change the file</p>
                        </>
                    ) : (
                        <>
                           <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to select a CSV file</span></p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">All jobs from CSV will use the settings from the form on the left.</p>
                        </>
                    )}
                </div>
                <input id="csv-file-upload" type="file" className="hidden" accept=".csv" onChange={handleCsvFileSelect} />
            </label>
        </div>
        <button 
            type="button" 
            onClick={processCsvFile}
            disabled={!csvFile}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed mt-auto"
          >
            Add Jobs From File Upload
        </button>
      </div>
    </div>
  );
};

export default JobForm;
