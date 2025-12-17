
import React from 'react';
import { Character, CharacterImage } from '../types';
import { TrashIcon, StarIcon } from './icons';
import { fileToBase64 } from '../services/geminiService';

interface Props {
  characters: Character[];
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onSetDefault: (id: string) => void;
}

const CharacterManager: React.FC<Props> = ({ characters, onUpdate, onSetDefault }) => {
  const handleUpload = async (id: string, files: FileList | null) => {
    if (!files) return;
    const char = characters.find(c => c.id === id);
    if (!char) return;

    const newImages: CharacterImage[] = [];
    for (let i = 0; i < files.length; i++) {
      if (char.images.length + newImages.length >= 5) break;
      const { data, mimeType } = await fileToBase64(files[i]);
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(files[i]),
        data,
        mimeType
      });
    }
    onUpdate(id, { images: [...char.images, ...newImages] });
  };

  const removeImage = (charId: string, imgId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    onUpdate(charId, { images: char.images.filter(img => img.id !== imgId) });
  };

  return (
    <div className="space-y-4 mb-10">
      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-blue-300 text-sm flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <p>
          <b>Lưu ý quan trọng:</b> Kích thước của các ảnh tham chiếu dưới đây sẽ quyết định kích thước của tất cả ảnh được tạo ra. 
          Vui lòng thay đổi kích thước/tỉ lệ ảnh của bạn trước khi upload để có kết quả mong muốn.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {characters.map(char => (
          <div key={char.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={char.name}
                onChange={e => onUpdate(char.id, { name: e.target.value })}
                className="bg-transparent border-b border-slate-600 focus:border-blue-500 outline-none text-lg font-bold text-white w-2/3"
                placeholder="Tên nhân vật..."
              />
              <button
                onClick={() => onSetDefault(char.id)}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                title="Đặt làm mặc định"
              >
                <StarIcon filled={char.isDefault} />
              </button>
            </div>

            <div 
              className="relative h-40 bg-slate-900 rounded-lg border-2 border-dashed border-slate-700 flex flex-wrap gap-2 p-2 overflow-y-auto"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                handleUpload(char.id, e.dataTransfer.files);
              }}
            >
              {char.images.map(img => (
                <div key={img.id} className="relative w-16 h-16 group">
                  <img src={img.url} className="w-full h-full object-cover rounded shadow" alt="ref" />
                  <button 
                    onClick={() => removeImage(char.id, img.id)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              {char.images.length < 5 && (
                <label className="w-16 h-16 flex flex-col items-center justify-center bg-slate-700 hover:bg-slate-600 rounded cursor-pointer transition-colors">
                  <span className="text-2xl text-slate-400">+</span>
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={e => handleUpload(char.id, e.target.files)} 
                  />
                </label>
              )}
            </div>

            <textarea
              value={char.styleDescription}
              onChange={e => onUpdate(char.id, { styleDescription: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 h-24 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Mô tả phong cách, trang phục mặc định..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterManager;
