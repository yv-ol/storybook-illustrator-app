import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
    initialError?: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialError }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [error, setError] = useState<string | null>(initialError || null);

    const handleSave = () => {
        if (!apiKeyInput.trim()) {
            setError('API Key cannot be empty.');
            return;
        }
        setError(null);
        onSave(apiKeyInput);
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 border border-slate-200">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Welcome!</h2>
                    <p className="mt-2 text-slate-600">
                        Please enter your Google AI API key to begin creating your storybook.
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 mb-1">
                            Your API Key
                        </label>
                        <input
                            id="api-key-input"
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => {
                                setApiKeyInput(e.target.value);
                                if (error) setError(null);
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your key here"
                            autoFocus
                        />
                         <p className="mt-2 text-xs text-slate-500">
                            You can get a free key from {' '}
                            <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                Google AI Studio
                            </a>.
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>
                    )}

                    <button
                        onClick={handleSave}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                    >
                        Save &amp; Continue
                    </button>
                </div>
                 <p className="mt-6 text-center text-xs text-slate-500">
                    Your key is stored securely in your browser's local storage and is only sent directly to Google's APIs.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyModal;