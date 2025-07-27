
import React, { useState, useCallback, useEffect } from 'react';
import { ArtStyle, StoryPage, BookCover } from './types';
import { generateImage, generateSurpriseContent, generateTitle, generateImagePrompt, initializeAi } from './services/geminiService';
import SetupSection from './components/SetupSection';
import StoryCreator from './components/StoryCreator';
import StorybookViewer from './components/StorybookGallery';
import ApiKeyModal from './components/ApiKeyModal';
import { ART_STYLES_WITH_PREVIEWS } from './constants';

const Header: React.FC = () => (
    <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-600">Personalized Storybook Illustrator</h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Bring your stories to life! Describe your character, write your story, and create a book.</p>
    </header>
);

const Footer: React.FC<{ onChangeApiKey: () => void }> = ({ onChangeApiKey }) => (
    <footer className="text-center mt-12 py-6 border-t border-slate-200 text-xs text-slate-500">
        <p>
            <button onClick={onChangeApiKey} className="underline hover:text-slate-700">Change API Key</button>
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} Personalized Storybook Illustrator. Made by Yvette at <a href="https://yvetteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">yvetteo.com</a>.</p>
        <p className="mt-1">Made using Google's Gemini 2.5 Flash and Imagen 3 models. This is a portfolio project and not for commercial use.</p>
    </footer>
);

interface Book {
    cover: BookCover | null;
    pages: StoryPage[];
    backCoverUrl: string | null;
}

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('googleApiKey'));

    const [artStyle, setArtStyle] = useState<ArtStyle | ''>('');
    const [characterDescription, setCharacterDescription] = useState<string>('');
    const [numberOfPages, setNumberOfPages] = useState<number>(3);
    const [pageTexts, setPageTexts] = useState<string[]>(['', '', '']);
    
    const [book, setBook] = useState<Book>({ cover: null, pages: [], backCoverUrl: null });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSurprising, setIsSurprising] = useState<boolean>(false);

    useEffect(() => {
        if (apiKey) {
            initializeAi(apiKey);
        }
    }, [apiKey]);

    useEffect(() => {
        setPageTexts(currentTexts => {
            const newTexts = new Array(numberOfPages).fill('');
            const limit = Math.min(currentTexts.length, numberOfPages);
            for (let i = 0; i < limit; i++) {
                newTexts[i] = currentTexts[i];
            }
            return newTexts;
        });
        // Clear generated book if page count changes
        setBook({ cover: null, pages: [], backCoverUrl: null });
    }, [numberOfPages]);

    const handleApiKeySave = (newKey: string) => {
        if (newKey.trim()) {
            localStorage.setItem('googleApiKey', newKey.trim());
            setApiKey(newKey.trim());
            setError(null);
        }
    };

    const handleChangeApiKey = () => {
        localStorage.removeItem('googleApiKey');
        setApiKey(null);
    };

    const handleGenerationError = useCallback((err: unknown) => {
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        if (message === 'API_KEY_MISSING') {
             setError("Your API key is missing or invalid. Please provide a valid key.");
             handleChangeApiKey();
        } else if (message === 'QUOTA_EXCEEDED') {
            setError("The API quota has been exceeded. Please try again later or with a different key.");
        } else {
           setError(message);
        }
        // Clear partial results on failure
        setBook({ cover: null, pages: [], backCoverUrl: null });
    }, []);

    const handleSurpriseMe = useCallback(async () => {
        setIsSurprising(true);
        setError(null);
        try {
            const randomPageCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 pages
            setNumberOfPages(randomPageCount);

            const content = await generateSurpriseContent(randomPageCount);
            const randomStyle = ART_STYLES_WITH_PREVIEWS[Math.floor(Math.random() * ART_STYLES_WITH_PREVIEWS.length)];

            setArtStyle(randomStyle.name);
            setCharacterDescription(content.character);
            setPageTexts(content.story);
        } catch (err) {
            handleGenerationError(err);
        } finally {
            setIsSurprising(false);
        }
    }, [handleGenerationError]);

    const handleStartOver = useCallback(() => {
        setArtStyle('');
        setCharacterDescription('');
        setNumberOfPages(3);
        setPageTexts(['', '', '']);
        setBook({ cover: null, pages: [], backCoverUrl: null });
        setError(null);
    }, []);

    const handleGenerateStorybook = useCallback(async () => {
        setError(null);
        if (!artStyle || !characterDescription || pageTexts.some(text => !text.trim())) {
            setError("Please select an Art Style, describe your Character, and write the story for all pages.");
            return;
        }

        setIsLoading(true);
        setBook({ cover: null, pages: [], backCoverUrl: null });

        try {
            // 1. Generate Title
            const title = await generateTitle(characterDescription, pageTexts);

            // 2. Generate Cover Image
            const coverPrompt = await generateImagePrompt({
                artStyle,
                characterDescription,
                isCover: true,
                title
            });
            const coverImageUrl = await generateImage(coverPrompt);
            setBook(prev => ({ ...prev, cover: { title, imageUrl: coverImageUrl } }));

            // 3. Generate Story Page Images Sequentially
            const generatedPages: StoryPage[] = [];
            for (let i = 0; i < pageTexts.length; i++) {
                const text = pageTexts[i];
                const pagePrompt = await generateImagePrompt({
                    artStyle,
                    characterDescription,
                    pageText: text
                });
                const imageUrl = await generateImage(pagePrompt);
                
                const newPage = {
                    pageNumber: i + 1,
                    text: pageTexts[i],
                    imageUrl: imageUrl,
                };
                generatedPages.push(newPage);
                setBook(prev => ({ ...prev, pages: [...generatedPages] })); // Update state incrementally
            }

            // 4. Generate Back Cover Image
            const backCoverPrompt = await generateImagePrompt({
                artStyle,
                isBackCover: true,
            });
            const newBackCoverUrl = await generateImage(backCoverPrompt);
            setBook(prev => ({...prev, backCoverUrl: newBackCoverUrl }));

        } catch (err) {
             handleGenerationError(err);
        } finally {
            setIsLoading(false);
        }
    }, [artStyle, characterDescription, pageTexts, handleGenerationError]);

    if (!apiKey) {
        return <ApiKeyModal onSave={handleApiKeySave} initialError={error} />;
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <main className="max-w-4xl mx-auto">
                <Header />
                <div className="text-center my-6">
                     <div className="flex justify-center items-center gap-4">
                        <button
                            onClick={handleSurpriseMe}
                            disabled={isSurprising || isLoading}
                            className="inline-flex items-center justify-center px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSurprising ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                "✨ Surprise Me!"
                            )}
                        </button>
                         <button
                            onClick={handleStartOver}
                            disabled={isSurprising || isLoading}
                            className="inline-flex items-center justify-center px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
                <div className="space-y-8">
                    <SetupSection 
                        artStyle={artStyle}
                        setArtStyle={setArtStyle}
                        characterDescription={characterDescription}
                        setCharacterDescription={setCharacterDescription}
                        numberOfPages={numberOfPages}
                        setNumberOfPages={setNumberOfPages}
                        isLoading={isLoading || isSurprising}
                    />
                    <StoryCreator
                        pageTexts={pageTexts}
                        setPageTexts={setPageTexts}
                        numberOfPages={numberOfPages}
                        onGenerate={handleGenerateStorybook}
                        isLoading={isLoading}
                        error={error}
                    />
                    <div className="pt-8">
                         <StorybookViewer 
                            cover={book.cover}
                            pages={book.pages} 
                            backCoverUrl={book.backCoverUrl}
                            isLoading={isLoading} 
                         />
                    </div>
                </div>
            </main>
            <Footer onChangeApiKey={handleChangeApiKey} />
        </div>
    );
};

export default App;