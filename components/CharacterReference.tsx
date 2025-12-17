import React, { useRef } from 'react';
import { Character } from '../types';
import { UploadIcon } from './icons';

interface CharacterSlotProps {
    character: Character;
    onImageChange: (id: number, file: File) => void;
    onNameChange: (id: number, name: string) => void;
    onImageRemove: (id: number) => void;
    onSelect: (id: number) => void;
}

const CharacterSlot: React.FC<CharacterSlotProps> = ({ character, onImageChange, onNameChange, onImageRemove, onSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleContainerClick = () => {
        if (!character.imageUrl) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageChange(character.id, e.target.files[0]);
        }
    };
    
    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onImageRemove(character.id);
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className="relative w-full aspect-square bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-slate-700/80 transition-colors group"
                onClick={handleContainerClick}
            >
                {character.imageUrl ? (
                    <>
                        <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover rounded-md" />
                         <button onClick={handleRemoveClick} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xl leading-none">&times;</button>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <UploadIcon />
                        <span className="text-sm">+ Tải ảnh lên</span>
                    </div>
                )}
                 <input
                    type="checkbox"
                    checked={!!character.isSelected}
                    onChange={() => onSelect(character.id)}
                    onClick={(e) => e.stopPropagation()}
                    title="Select this character for Image-to-Video jobs"
                    className="absolute top-2 left-2 h-5 w-5 rounded bg-slate-700/80 border-slate-500 text-blue-500 focus:ring-blue-600 cursor-pointer"
                    disabled={!character.imageFile}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            <input
                type="text"
                value={character.name}
                onChange={(e) => onNameChange(character.id, e.target.value)}
                className="mt-1 w-full bg-transparent text-center text-slate-300 border-none focus:ring-0 p-1"
                aria-label={`Character ${character.id + 1} name`}
            />
        </div>
    );
}


interface CharacterReferenceProps {
    characters: Character[];
    onImageChange: (id: number, file: File) => void;
    onNameChange: (id: number, name: string) => void;
    onPromptChange: (id: number, prompt: string) => void;
    onImageRemove: (id: number) => void;
    onSelect: (id: number) => void;
    contextImageUrl?: string;
    contextPrompt: string;
    isCreativeContext: boolean;
    isAnalyzingContextImage: boolean;
    onContextImageChange: (file: File) => void;
    onContextImageRemove: () => void;
    onContextPromptChange: (prompt: string) => void;
    onCreativeContextChange: (checked: boolean) => void;
}

const CharacterReference: React.FC<CharacterReferenceProps> = ({ 
    characters, onImageChange, onNameChange, onPromptChange, onImageRemove, onSelect,
    contextImageUrl, contextPrompt, isCreativeContext, isAnalyzingContextImage,
    onContextImageChange, onContextImageRemove, onContextPromptChange, onCreativeContextChange
}) => {
    const contextFileInputRef = useRef<HTMLInputElement>(null);

    const handleContextContainerClick = () => {
        if (!contextImageUrl) {
            contextFileInputRef.current?.click();
        }
    };

    const handleContextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onContextImageChange(e.target.files[0]);
        }
        e.target.value = ''; // Allow re-uploading the same file
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ảnh nhân vật tham chiếu</h2>
            
            <div className="mb-6 border-b border-slate-700 pb-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">Bối cảnh tham chiếu</h3>
                    <div className="mt-4 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-full md:w-44 flex-shrink-0">
                            <div
                                className="relative w-full aspect-square bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-slate-700/80 transition-colors group"
                                onClick={handleContextContainerClick}
                                role="button"
                                aria-label="Upload context image"
                            >
                                {contextImageUrl ? (
                                    <>
                                        <img src={contextImageUrl} alt="Context Preview" className="w-full h-full object-cover rounded-md" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onContextImageRemove(); }} 
                                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xl leading-none"
                                            aria-label="Remove context image"
                                        >&times;</button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 p-2">
                                        <UploadIcon />
                                        <span className="text-sm">+ Tải ảnh lên</span>
                                    </div>
                                )}
                                <input type="file" ref={contextFileInputRef} onChange={handleContextFileChange} accept="image/*" className="hidden" />
                            </div>
                             <p className="text-center text-sm text-slate-400 mt-2">Bối cảnh</p>
                        </div>
                        <div className="flex-grow pt-1">
                            <div className="flex items-start">
                                <input
                                id="creative-context"
                                type="checkbox"
                                checked={isCreativeContext}
                                onChange={(e) => onCreativeContextChange(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3 text-sm">
                                <label htmlFor="creative-context" className="font-bold text-slate-200">Sáng tạo từ bối cảnh</label>
                                <p className="text-slate-400 mt-1">
                                    Khi được chọn, AI sẽ dùng ảnh này làm cảm hứng để tạo ra các bối cảnh mới từ nhiều góc độ khác nhau, phù hợp với câu lệnh của bạn.
                                </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-white mb-4">Câu lệnh</h3>
                    <div className="relative">
                        <textarea
                            id="context-prompt"
                            value={contextPrompt}
                            onChange={(e) => onContextPromptChange(e.target.value)}
                            placeholder={ isAnalyzingContextImage ? "Analyzing image..." : "Mô tả hành động, bối cảnh, bố cục bạn muốn..." }
                            rows={4}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-wait"
                            disabled={isAnalyzingContextImage}
                            aria-label="Context prompt"
                        />
                        {isAnalyzingContextImage && (
                        <div className="absolute right-2.5 top-2.5 h-4 w-4 border-t-2 border-r-2 border-slate-300 rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-6">
                {characters.map(char => (
                    <div key={`prompt-${char.id}`} className="relative">
                        <label htmlFor={`char-prompt-${char.id}`} className="block text-sm font-medium text-slate-300 mb-1">
                            Prompt Nhân vật {char.id + 1}
                        </label>
                        <input
                            type="text"
                            id={`char-prompt-${char.id}`}
                            value={char.prompt || ''}
                            onChange={(e) => onPromptChange(char.id, e.target.value)}
                            placeholder={
                                char.isGeneratingPrompt 
                                ? "Analyzing image..." 
                                : `Mô tả cho ${char.name}...`
                            }
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm disabled:opacity-60 disabled:cursor-wait"
                            disabled={char.isGeneratingPrompt}
                        />
                         {char.isGeneratingPrompt && (
                            <div className="absolute right-2.5 top-[2.3rem] h-4 w-4 border-t-2 border-r-2 border-slate-300 rounded-full animate-spin"></div>
                        )}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {characters.map(char => (
                    <CharacterSlot
                        key={char.id}
                        character={char}
                        onImageChange={onImageChange}
                        onNameChange={onNameChange}
                        onImageRemove={onImageRemove}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default CharacterReference;