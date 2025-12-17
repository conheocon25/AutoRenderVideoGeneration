
import React, { useState } from 'react';
import { Scene, Character, JobStatus } from '../types';
import { PlusIcon, PlayIcon, DownloadIcon, TrashIcon, CloseIcon } from './icons';

interface Props {
  scenes: Scene[];
  characters: Character[];
  onAddScene: () => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onRemoveScene: (id: string) => void;
  onGenerate: (id: string) => void;
  onGenerateAll: () => void;
  onViewImage: (index: number) => void;
}

const SceneTable: React.FC<Props> = ({ 
  scenes, characters, onAddScene, onUpdateScene, onRemoveScene, onGenerate, onGenerateAll, onViewImage 
}) => {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [warning, setWarning] = useState<{msg: string} | null>(null);

  const handleGenerateClick = (scene: Scene) => {
    const firstCharScene = scenes.find(s => s.selectedCharacterIds.length > 0);
    
    // Logic: If trying to generate a scene with NO character, and there's NO character-based image in the project yet
    const hasAnyCharImage = scenes.some(s => s.resultUrl && s.selectedCharacterIds.length > 0);
    
    if (scene.selectedCharacterIds.length === 0 && !hasAnyCharImage) {
      if (!firstCharScene) {
        setWarning({ msg: "Vui lòng chọn nhân vật cho ít nhất một phân cảnh trước để làm chuẩn phong cách." });
      } else {
        setWarning({ msg: `Vui lòng tạo ảnh cho Phân cảnh ${firstCharScene.index} trước để có ảnh tham chiếu phong cách.` });
      }
      return;
    }
    onGenerate(scene.id);
  };

  const handleDownloadSingle = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${index + 1}.png`;
    link.click();
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative">
      {/* Warning Modal */}
      {warning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-4xl text-blue-500 mx-auto">ℹ️</div>
            <p className="text-lg text-white font-medium">{warning.msg}</p>
            <button 
              onClick={() => setWarning(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
            >Đã hiểu</button>
          </div>
        </div>
      )}

      <div className="p-4 flex justify-between items-center bg-slate-800/80 border-b border-slate-700 backdrop-blur-md">
        <h2 className="text-xl font-bold">Kịch bản chi tiết</h2>
        <div className="flex gap-3">
          <button 
            onClick={onGenerateAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-lg active:scale-95"
          >
            <PlayIcon /> Tạo Ảnh Hàng Loạt
          </button>
          <button 
            onClick={onAddScene}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <PlusIcon /> Thêm Phân Đoạn
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 w-12 text-center">Scene</th>
              <th className="p-4 w-1/4">Kịch bản</th>
              <th className="p-4 w-1/4">Mô tả phân cảnh (Prompt)</th>
              <th className="p-4 w-1/6">Nhân vật</th>
              <th className="p-4 w-1/6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {scenes.map((scene, idx) => (
              <tr key={scene.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 text-center font-mono text-slate-500 align-middle">
                  {scene.index}
                </td>
                <td className="p-4 align-middle">
                  <textarea
                    value={scene.script}
                    onChange={e => onUpdateScene(scene.id, { script: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white resize-none h-20 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Nội dung kịch bản..."
                  />
                </td>
                <td className="p-4 align-middle">
                  <textarea
                    value={scene.prompt}
                    onChange={e => onUpdateScene(scene.id, { prompt: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-blue-100 resize-none h-20 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Mô tả hình ảnh..."
                  />
                </td>
                <td className="p-4 align-middle">
                  <button 
                    onClick={() => setActivePopup(scene.id)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-slate-300 text-left truncate min-h-[40px] hover:border-slate-500"
                  >
                    {scene.selectedCharacterIds.length > 0 
                      ? characters.filter(c => scene.selectedCharacterIds.includes(c.id)).map(c => c.name).join(', ')
                      : 'None (Chỉ đồng nhất phong cách)'}
                  </button>
                  
                  {activePopup === scene.id && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                          <h3 className="text-lg font-bold text-white">Chọn nhân vật cho Scene {scene.index}</h3>
                          <button onClick={() => setActivePopup(null)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          <label className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors group italic">
                            <input 
                              type="checkbox"
                              checked={scene.selectedCharacterIds.length === 0}
                              onChange={() => onUpdateScene(scene.id, { selectedCharacterIds: [] })}
                              className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-slate-400">None (Cảnh không có nhân vật chính)</span>
                          </label>
                          <div className="h-px bg-slate-700 my-2"></div>
                          {characters.map(char => (
                            <label key={char.id} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors group">
                              <input 
                                type="checkbox"
                                checked={scene.selectedCharacterIds.includes(char.id)}
                                onChange={e => {
                                  const ids = e.target.checked 
                                    ? [...scene.selectedCharacterIds, char.id]
                                    : scene.selectedCharacterIds.filter(id => id !== char.id);
                                  onUpdateScene(scene.id, { selectedCharacterIds: ids });
                                }}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-3">
                                {char.images[0] && <img src={char.images[0].url} className="w-8 h-8 rounded-full object-cover" />}
                                <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{char.name || `Nhân vật ${char.id}`}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        <button 
                          onClick={() => setActivePopup(null)}
                          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
                        >Xong</button>
                      </div>
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex flex-col items-center gap-3">
                    {scene.resultUrl ? (
                      <div className="relative group">
                        <div className="w-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                          <img 
                            src={scene.resultUrl} 
                            className="w-full h-auto object-contain" 
                            alt="result"
                            onClick={() => onViewImage(idx)}
                          />
                        </div>
                        <div className="mt-2 flex gap-1 justify-center">
                           <button onClick={() => handleGenerateClick(scene)} className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md text-slate-300">Vẽ lại</button>
                           <button 
                              onClick={() => handleDownloadSingle(scene.resultUrl!, idx)}
                              className="text-[10px] bg-green-700 hover:bg-green-600 px-2 py-1 rounded-md text-white"
                           >Tải về</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleGenerateClick(scene)}
                        disabled={scene.isGenerating}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full disabled:bg-slate-700 transition-all shadow-md active:scale-90"
                      >
                        {scene.isGenerating ? (
                          <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : <PlayIcon />}
                      </button>
                    )}
                    <button onClick={() => onRemoveScene(scene.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SceneTable;
