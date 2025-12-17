
import React, { useState } from 'react';
import { Character, Scene, JobStatus } from './types';
import CharacterManager from './components/CharacterManager';
import SceneTable from './components/SceneTable';
import ImageViewer from './components/ImageViewer';
import { generateImageWithCharacters } from './services/geminiService';
import JSZip from 'jszip';

const INITIAL_CHARACTERS: Character[] = [
  { id: 'char1', name: 'Nhân vật 1', styleDescription: '', images: [], isDefault: true },
  { id: 'char2', name: 'Nhân vật 2', styleDescription: '', images: [], isDefault: false },
  { id: 'char3', name: 'Nhân vật 3', styleDescription: '', images: [], isDefault: false },
];

function App() {
  const [projectName, setProjectName] = useState<string>('Du_An_Sang_Tao_01');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handleUpdateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleSetDefaultCharacter = (id: string) => {
    setCharacters(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
  };

  const addScene = () => {
    const defaultChar = characters.find(c => c.isDefault);
    const newIndex = scenes.length + 1;
    const newScene: Scene = {
      id: Math.random().toString(36).substr(2, 9),
      index: newIndex,
      script: '',
      prompt: '',
      selectedCharacterIds: defaultChar ? [defaultChar.id] : [],
      status: JobStatus.PENDING,
    };
    setScenes(prev => [...prev, newScene]);
  };

  const removeScene = (id: string) => {
    setScenes(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return filtered.map((s, idx) => ({ ...s, index: idx + 1 }));
    });
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const generateSceneImage = async (id: string, refinePrompt?: string) => {
    const scene = scenes.find(s => s.id === id);
    if (!scene) return;

    updateScene(id, { isGenerating: true });
    try {
      const resultUrl = await generateImageWithCharacters(scene, scenes, characters, refinePrompt);
      updateScene(id, { resultUrl, status: JobStatus.SUCCESS, isGenerating: false });
    } catch (error) {
      console.error(error);
      updateScene(id, { error: 'Lỗi', status: JobStatus.FAILED, isGenerating: false });
    }
  };

  const generateAll = async () => {
    // 1. Find first scene with character
    const firstCharScene = scenes.find(s => s.selectedCharacterIds.length > 0);
    
    if (!firstCharScene) {
      alert("Vui lòng chọn nhân vật cho ít nhất một phân cảnh để làm chuẩn phong cách.");
      return;
    }

    // Process order:
    // A. The First Character Scene (to establish style)
    // B. Scenes 1 to X-1 (going backwards/up)
    // C. Scenes X+1 to N (going forwards/down)
    
    const xIndex = scenes.findIndex(s => s.id === firstCharScene.id);
    const beforeX = scenes.slice(0, xIndex);
    const afterX = scenes.slice(xIndex + 1);

    // Start with X
    await generateSceneImage(firstCharScene.id);

    // Then before X
    for (const s of beforeX) {
      await generateSceneImage(s.id);
    }

    // Then after X
    for (const s of afterX) {
      await generateSceneImage(s.id);
    }
  };

  const downloadAll = async () => {
    if (!projectName.trim()) {
      alert("Vui lòng nhập tên dự án trước khi tải về.");
      return;
    }

    const zip = new JSZip();
    const successfulScenes = scenes.filter(s => s.resultUrl);
    
    if (successfulScenes.length === 0) {
      alert("Chưa có ảnh nào được tạo thành công.");
      return;
    }

    const folder = zip.folder(projectName);
    for (const scene of successfulScenes) {
      try {
        const response = await fetch(scene.resultUrl!);
        const blob = await response.blob();
        folder?.file(`${scene.index}.png`, blob);
      } catch (e) {
        console.error(e);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}.zip`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-300 to-blue-600 tracking-tight">
              AI CHARACTER STUDIO
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tên dự án:</span>
              <input 
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-1.5 text-sm text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 font-medium"
                placeholder="Nhập tên dự án..."
              />
            </div>
          </div>
          <button 
            onClick={downloadAll}
            className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-blue-600 rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/30 active:scale-95"
          >
            Tải Xuống Toàn Bộ (ZIP)
          </button>
        </header>

        <main className="space-y-12">
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              Thiết lập Nhân vật Tham chiếu
            </h2>
            <CharacterManager 
              characters={characters} 
              onUpdate={handleUpdateCharacter} 
              onSetDefault={handleSetDefaultCharacter}
            />
          </section>

          <section>
            <SceneTable 
              scenes={scenes}
              characters={characters}
              onAddScene={addScene}
              onRemoveScene={removeScene}
              onUpdateScene={updateScene}
              onGenerate={generateSceneImage}
              onGenerateAll={generateAll}
              onViewImage={(idx) => setViewerIndex(idx)}
            />
          </section>
        </main>

        {viewerIndex !== null && (
          <ImageViewer 
            scenes={scenes}
            characters={characters}
            currentIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onNavigate={(idx) => setViewerIndex(idx)}
            onRefine={generateSceneImage}
          />
        )}
      </div>
    </div>
  );
}

export default App;
