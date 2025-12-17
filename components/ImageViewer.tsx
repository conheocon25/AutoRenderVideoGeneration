
import React, { useState, useEffect, useCallback } from 'react';
import { Scene, Character } from '../types';
import { CloseIcon, LeftIcon, RightIcon, PlayIcon, DownloadIcon } from './icons';

interface Props {
  scenes: Scene[];
  characters: Character[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onRefine: (sceneId: string, prompt: string) => void;
}

const ImageViewer: React.FC<Props> = ({ scenes, characters, currentIndex, onClose, onNavigate, onRefine }) => {
  const scene = scenes[currentIndex];
  const [refinePrompt, setRefinePrompt] = useState('');

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + scenes.length) % scenes.length);
  }, [currentIndex, scenes.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % scenes.length);
  }, [currentIndex, scenes.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  if (!scene) return null;

  const handleImageAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleDownload = () => {
    if (!scene.resultUrl) return;
    const link = document.createElement('a');
    link.href = scene.resultUrl;
    link.download = `Scene_${currentIndex + 1}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/98 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute top-6 left-6 text-slate-400 font-mono text-sm bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
        Phân cảnh {currentIndex + 1} / {scenes.length}
      </div>
      
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[160] bg-slate-900/50 p-2 rounded-full">
        <CloseIcon />
      </button>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-stretch h-full max-h-[85vh]">
        {/* Left: Image Container */}
        <div 
          className="relative flex-1 flex items-center justify-center cursor-pointer select-none group"
          onClick={handleImageAreaClick}
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hidden md:block">
            <LeftIcon />
          </div>
          
          {scene.resultUrl ? (
             <img 
               src={scene.resultUrl} 
               className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-500 ease-out" 
               alt="View" 
             />
          ) : (
            <div className="w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
              <span className="text-slate-600 font-medium">Ảnh chưa được tạo</span>
            </div>
          )}

          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hidden md:block">
            <RightIcon />
          </div>

          {/* Mobile indicator */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4 md:hidden">
             <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="bg-slate-800/80 p-3 rounded-full"><LeftIcon /></button>
             <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="bg-slate-800/80 p-3 rounded-full"><RightIcon /></button>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 bg-slate-900/80 p-8 rounded-3xl border border-slate-800 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Kịch bản chi tiết</h3>
            <p className="text-xl text-white leading-relaxed font-medium">{scene.script || 'Chưa có nội dung kịch bản'}</p>
            <div className="pt-4 border-t border-slate-800">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nhân vật tham gia</h4>
               <div className="flex flex-wrap gap-2">
                  {scene.selectedCharacterIds.map(id => {
                    const char = characters.find(c => c.id === id);
                    return char ? (
                      <span key={id} className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20">
                        {char.name}
                      </span>
                    ) : null;
                  })}
               </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Tinh chỉnh hình ảnh (Regenerate)</label>
              <textarea
                value={refinePrompt}
                onChange={e => setRefinePrompt(e.target.value)}
                placeholder="Ví dụ: Thay đổi ánh sáng thành ban đêm, nhân vật mặc áo đỏ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none transition-all placeholder:text-slate-700"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <button
                onClick={handleDownload}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border border-slate-700"
              >
                <DownloadIcon /> Tải ảnh
              </button>
              <button
                onClick={() => {
                  onRefine(scene.id, refinePrompt);
                  setRefinePrompt('');
                }}
                disabled={scene.isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                {scene.isGenerating ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <> <PlayIcon /> Vẽ lại </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-slate-600 text-xs flex gap-8 items-center bg-slate-900/30 px-6 py-2 rounded-full border border-slate-800/50">
        <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</kbd> Đóng</span>
        <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">← / →</kbd> Chuyển ảnh</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Click trái/phải màn hình để chuyển ảnh</span>
      </div>
    </div>
  );
};

export default ImageViewer;
