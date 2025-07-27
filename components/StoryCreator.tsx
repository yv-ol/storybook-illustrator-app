import React from 'react';

interface StoryCreatorProps {
    pageTexts: string[];
    setPageTexts: (texts: string[]) => void;
    numberOfPages: number;
    onGenerate: () => void;
    isLoading: boolean;
    error: string | null;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ pageTexts, setPageTexts, numberOfPages, onGenerate, isLoading, error }) => {

    const handleTextChange = (index: number, value: string) => {
        const newTexts = [...pageTexts];
        newTexts[index] = value;
        setPageTexts(newTexts);
    };

    return (
        <section className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">2. What happens on each page of your story?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 {[...Array(numberOfPages).keys()].map((index) => (
                    <div key={index}>
                        <label htmlFor={`page-text-${index}`} className="block text-sm font-medium text-slate-600 mb-2">
                            Page {index + 1}
                        </label>
                        <textarea
                            id={`page-text-${index}`}
                            rows={4}
                            value={pageTexts[index] || ''}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder={`e.g., The fox finds a shiny key...`}
                            disabled={isLoading}
                            maxLength={1000}
                        />
                        <p className="text-right text-xs text-slate-400 mt-1">{(pageTexts[index] || '').length} / 1000</p>
                    </div>
                 ))}
            </div>
           
            {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="mt-6 border-t border-slate-200 pt-6 text-center">
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Your Storybook...
                        </>
                    ) : (
                        "Generate My Storybook"
                    )}
                </button>
            </div>
        </section>
    );
};

export default StoryCreator;