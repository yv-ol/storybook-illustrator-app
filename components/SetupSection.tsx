import React from 'react';
import { ArtStyle } from '../types';
import { ART_STYLES_WITH_PREVIEWS } from '../constants';

interface SetupSectionProps {
    artStyle: ArtStyle | '';
    setArtStyle: (style: ArtStyle) => void;
    characterDescription: string;
    setCharacterDescription: (desc: string) => void;
    numberOfPages: number;
    setNumberOfPages: (num: number) => void;
    isLoading: boolean;
}

const SetupSection: React.FC<SetupSectionProps> = ({ artStyle, setArtStyle, characterDescription, setCharacterDescription, numberOfPages, setNumberOfPages, isLoading }) => {
    return (
        <section className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">1. Describe your story!</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        Art Style
                    </label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {ART_STYLES_WITH_PREVIEWS.map(style => (
                            <button
                                key={style.name}
                                type="button"
                                onClick={() => setArtStyle(style.name)}
                                disabled={isLoading}
                                className={`text-center p-2 rounded-lg border-2 transition-all duration-200 ${artStyle === style.name ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-200 hover:border-blue-400'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <img src={style.preview} alt={`${style.name} preview`} className="w-full h-16 object-cover rounded-md mb-2" />
                                <span className="text-xs font-semibold text-slate-700">{style.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                     <label htmlFor="character-description" className="block text-sm font-medium text-slate-600 mb-2">
                        Main Character
                    </label>
                    <textarea
                        id="character-description"
                        rows={2}
                        value={characterDescription}
                        onChange={(e) => setCharacterDescription(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="e.g., A curious fox with fluffy orange fur..."
                        maxLength={1000}
                        disabled={isLoading}
                    />
                    <p className="text-right text-xs text-slate-400 mt-1">{characterDescription.length} / 1000</p>
                </div>

                 <div>
                    <label htmlFor="num-pages" className="block text-sm font-medium text-slate-600 mb-2">
                        Number of Pages
                    </label>
                    <select
                        id="num-pages"
                        value={numberOfPages}
                        onChange={(e) => setNumberOfPages(Number(e.target.value))}
                        className="w-full max-w-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        disabled={isLoading}
                    >
                        {[...Array(5).keys()].map(i => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    );
};

export default SetupSection;