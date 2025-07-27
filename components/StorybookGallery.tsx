import React, { useState, useEffect } from 'react';
import { StoryPage, BookCover } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StorybookViewerProps {
    cover: BookCover | null;
    pages: StoryPage[];
    backCoverUrl: string | null;
    isLoading: boolean;
}

const StorybookViewer: React.FC<StorybookViewerProps> = ({ cover, pages, backCoverUrl, isLoading }) => {
    const totalItems = (cover ? 1 : 0) + pages.length + (backCoverUrl ? 1 : 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentIndex(0);
        setExportError(null);
    }, [pages, cover, backCoverUrl]);

    const handleExportPdf = async () => {
        if (!cover) {
            setExportError("Cannot export without a generated storybook.");
            return;
        }
        setExportError(null);
        setIsExporting(true);

        try {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [800, 600] // A 4:3 aspect ratio format
            });

            const addPageToPdf = async (elementId: string) => {
                const element = document.getElementById(elementId);
                if (!element) return;

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            };

            await addPageToPdf('pdf-cover');

            for (let i = 0; i < pages.length; i++) {
                pdf.addPage();
                await addPageToPdf(`pdf-page-${i}`);
            }

            if (backCoverUrl) {
                pdf.addPage();
                await addPageToPdf('pdf-back-cover');
            }

            // Add the new footer page
            pdf.addPage();
            await addPageToPdf('pdf-footer');

            pdf.save(`${cover.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') || 'My_Storybook'}.pdf`);

        } catch (error) {
            console.error("Failed to export PDF:", error);
            setExportError("An error occurred while creating the PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <section className="text-center py-20 px-6 bg-white rounded-xl border-2 border-dashed border-slate-300">
                 <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-slate-600 font-semibold">Brewing up your story...</p>
                <p className="text-slate-500">This takes some time. Please chill.</p>
            </section>
        );
    }

    const hasContent = cover || pages.length > 0;

    if (!hasContent) {
        return (
            <section>
                 <h2 className="text-3xl font-bold text-slate-700 mb-6 text-center">3. Your Storybook</h2>
                 <div className="text-center py-12 px-6 bg-white rounded-xl border-2 border-dashed border-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="mt-4 text-slate-500">Your illustrated storybook will appear here once generated.</p>
                </div>
            </section>
        );
    }

    const renderContent = () => {
        if (currentIndex === 0 && cover) {
            return (
                <div className="bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">{cover.title}</h3>
                    <img src={cover.imageUrl} alt="Storybook cover" className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
            );
        }
        
        if (currentIndex === totalItems - 1 && backCoverUrl) {
            return (
                <div className="bg-slate-100 flex items-center justify-center p-4">
                    <img src={backCoverUrl} alt="The End" className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
            );
        }

        const pageIndex = currentIndex - (cover ? 1 : 0);
        if (pageIndex >= 0 && pageIndex < pages.length) {
            const currentPage = pages[pageIndex];
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="bg-slate-100 flex items-center justify-center p-4">
                         <img src={currentPage.imageUrl} alt={`Illustration for page ${currentPage.pageNumber}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-between">
                        <p className="text-slate-700 text-lg leading-relaxed flex-grow">{currentPage.text}</p>
                         <p className="mt-6 font-bold text-slate-500 text-right">Page {currentPage.pageNumber}</p>
                    </div>
                </div>
            )
        }
        
        return null;
    };
    
    const getPageLabel = () => {
        if (currentIndex === 0 && cover) return "Cover";
        if (currentIndex === totalItems - 1 && backCoverUrl) return "The End";
        const pageIndex = currentIndex - (cover ? 1 : 0);
        if (pageIndex >= 0 && pageIndex < pages.length) {
             return `Page ${pages[pageIndex].pageNumber} of ${pages.length}`;
        }
        return "";
    }

    return (
        <section>
            <h2 className="text-3xl font-bold text-slate-700 mb-6 text-center">3. Your Storybook</h2>
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200 min-h-[400px]">
                {renderContent()}
            </div>
            <div className="mt-6 flex justify-between items-center px-2">
                <button 
                    onClick={() => setCurrentIndex(i => i - 1)} 
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                >
                    ← Previous
                </button>
                <p className="font-bold text-slate-500">{getPageLabel()}</p>
                <button 
                    onClick={() => setCurrentIndex(i => i + 1)} 
                    disabled={currentIndex === totalItems - 1}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                >
                    Next →
                </button>
            </div>
            
            <div className="mt-6 text-center border-t border-slate-200 pt-6">
                <button
                    onClick={handleExportPdf}
                    disabled={isExporting || isLoading}
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isExporting ? 'Creating PDF...' : 'Export to PDF'}
                </button>
                {exportError && <p className="mt-2 text-sm text-red-600">{exportError}</p>}
            </div>

            {/* Hidden container for PDF generation */}
            <div className="absolute -left-[9999px] w-[800px]">
                {cover && (
                    <div id="pdf-cover" className="bg-white p-8 flex flex-col items-center justify-center text-center h-[600px] box-border">
                        <h2 className="text-4xl font-bold text-slate-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>{cover.title}</h2>
                        <div className="w-full h-[450px]">
                            <img src={cover.imageUrl} alt={cover.title} className="w-full h-full object-contain" />
                        </div>
                    </div>
                )}
                {pages.map((page, index) => (
                     <div id={`pdf-page-${index}`} key={`pdf-${index}`} className="bg-white p-8 flex flex-col h-[600px] w-[800px] box-border">
                        <div className="w-full max-h-[400px] flex-shrink-0">
                            <img src={page.imageUrl} alt={`Illustration for page ${page.pageNumber}`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col flex-grow pt-6 text-slate-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <p className="text-xl leading-relaxed flex-grow">{page.text}</p>
                            <p className="font-bold text-slate-500 text-right text-base mt-2">Page {page.pageNumber}</p>
                        </div>
                    </div>
                ))}
                {backCoverUrl && (
                    <div id="pdf-back-cover" className="bg-white flex items-center justify-center p-8 h-[600px] box-border">
                        <div className="w-full h-[500px]">
                            <img src={backCoverUrl} alt="The End" className="w-full h-full object-contain" />
                        </div>
                    </div>
                )}
                <div id="pdf-footer" className="bg-white p-8 flex flex-col items-center justify-center text-center h-[600px] box-border text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="border border-slate-300 rounded-lg p-10 bg-slate-50">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">About This Book</h3>
                        <p className="text-lg mt-4">&copy; {new Date().getFullYear()} Personalized Storybook Illustrator.</p>
                        <p className="text-lg mt-2">Created by Yvette at <a href="https://yvetteo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">yvetteo.com</a>.</p>
                        <p className="text-base mt-10">This storybook and its illustrations were generated using Google's Gemini 2.5 Flash and Imagen 3 models.</p>
                        <p className="text-sm mt-2">This is a portfolio project and not for commercial use.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StorybookViewer;