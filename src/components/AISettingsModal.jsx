import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  Sparkles, 
  Check, 
  Globe, 
  HelpCircle, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  ChevronDown, 
  Server, 
  Edit3, 
  ListFilter 
} from 'lucide-react';
import { fetchAISettings, saveAISettingsAPI, fetchModelsAPI } from '../utils/api';

export const TOP_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Fast, multimodal vision, generous free tier',
    defaultModel: 'gemini-1.5-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    placeholderKey: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    curatedModels: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-1.0-pro'
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, o1-mini with vision & tools',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    placeholderKey: 'sk-proj-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    curatedModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'o1-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Haiku with superior reasoning',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    placeholderKey: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    curatedModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229'
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra high-speed inference for Llama 3.3, 3.1 & Mixtral',
    defaultModel: 'llama-3.3-70b-versatile',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    placeholderKey: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    curatedModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.2-11b-vision-preview',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'High performance DeepSeek-V3 & DeepSeek-R1',
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com',
    placeholderKey: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    curatedModels: [
      'deepseek-chat',
      'deepseek-reasoner'
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Pixtral vision & Codestral',
    defaultModel: 'mistral-large-latest',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    placeholderKey: '...',
    keyUrl: 'https://console.mistral.ai/api-keys/',
    curatedModels: [
      'mistral-large-latest',
      'mistral-small-latest',
      'pixtral-12b-2409',
      'codestral-latest',
      'open-mistral-nemo'
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified gateway to 100+ models (Hermes, Claude, Llama)',
    defaultModel: 'nousresearch/hermes-3-llama-3.1-405b:extended',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    placeholderKey: 'sk-or-v1-...',
    keyUrl: 'https://openrouter.ai/keys',
    curatedModels: [
      'nousresearch/hermes-3-llama-3.1-405b:extended',
      'meta-llama/llama-3.3-70b-instruct',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-flash-1.5',
      'qwen/qwen-2.5-72b-instruct'
    ]
  },
  {
    id: 'hermes',
    name: 'Ollama / Local Hermes',
    description: 'Private local LLMs via Ollama, LM Studio, or vLLM',
    defaultModel: 'hermes-3-llama-3.1-8b',
    defaultBaseUrl: 'http://localhost:11434/v1',
    placeholderKey: 'Optional for local (e.g. ollama)',
    curatedModels: [
      'hermes-3-llama-3.1-8b',
      'llama3.2-vision',
      'llama3.3',
      'llama3.1',
      'mistral',
      'qwen2.5'
    ]
  },
  {
    id: 'custom',
    name: 'Custom / Other Endpoint',
    description: 'Any OpenAI-compatible API endpoint or proxy',
    defaultModel: 'custom-model',
    defaultBaseUrl: 'http://localhost:8000/v1',
    placeholderKey: 'Bearer token or API key',
    curatedModels: ['default']
  }
];

export default function AISettingsModal({ isOpen, onClose, onSaved }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [baseUrl, setBaseUrl] = useState('');
  
  // Dynamic model fetching state
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelsFetchStatus, setModelsFetchStatus] = useState(null); // { count, isFallback, message }
  const [isCustomModelInput, setIsCustomModelInput] = useState(false);

  const [statusMsg, setStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load models dynamically for a provider
  const loadModelsForProvider = async (targetProv, keyToUse, urlToUse) => {
    setIsFetchingModels(true);
    setModelsFetchStatus(null);
    try {
      const res = await fetchModelsAPI({
        provider: targetProv,
        apiKey: keyToUse,
        baseUrl: urlToUse
      });
      if (res && Array.isArray(res.models) && res.models.length > 0) {
        setAvailableModels(res.models);
        setModelsFetchStatus({
          count: res.models.length,
          isFallback: Boolean(res.isFallback),
          message: res.message || ''
        });

        // If current model is not in list and not typing custom, match default or take first
        setModel(prevModel => {
          if (res.models.includes(prevModel)) return prevModel;
          const conf = TOP_PROVIDERS.find(p => p.id === targetProv);
          if (conf && res.models.includes(conf.defaultModel)) return conf.defaultModel;
          return res.models[0];
        });
      }
    } catch (err) {
      console.warn('Failed to load models:', err);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAISettings().then(s => {
        const savedProvider = s.ai_provider || 'gemini';
        const savedKey = s.ai_api_key || '';
        const savedUrl = s.ai_base_url || '';
        const conf = TOP_PROVIDERS.find(p => p.id === savedProvider) || TOP_PROVIDERS[0];
        const savedModel = s.ai_model || conf.defaultModel;

        setProvider(savedProvider);
        setApiKey(savedKey);
        setBaseUrl(savedUrl || conf.defaultBaseUrl || '');
        setModel(savedModel);
        setStatusMsg('');

        // Preload models for this provider
        loadModelsForProvider(savedProvider, savedKey, savedUrl || conf.defaultBaseUrl || '');
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProviderConfig = TOP_PROVIDERS.find(p => p.id === provider) || TOP_PROVIDERS[0];

  const handleProviderChange = (newProvId) => {
    setProvider(newProvId);
    const conf = TOP_PROVIDERS.find(p => p.id === newProvId) || TOP_PROVIDERS[0];
    setModel(conf.defaultModel);
    setIsCustomModelInput(false);
    const newBaseUrl = conf.defaultBaseUrl || '';
    setBaseUrl(newBaseUrl);

    // Auto-fetch models for newly selected API endpoint
    loadModelsForProvider(newProvId, apiKey, newBaseUrl);
  };

  const handleManualFetchModels = () => {
    loadModelsForProvider(provider, apiKey, baseUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg('');

    try {
      await saveAISettingsAPI({
        ai_provider: provider,
        ai_api_key: apiKey.trim(),
        ai_model: model.trim(),
        ai_base_url: baseUrl.trim()
      });
      setStatusMsg('Settings saved successfully!');
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setStatusMsg('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                AI & Model Configuration
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Select your endpoint and fetch available models automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
          {statusMsg && (
            <div className={`p-3 rounded-xl font-medium ${
              statusMsg.includes('success') 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {statusMsg}
            </div>
          )}

          {/* Provider Dropdown Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-500" />
                API Endpoint Provider
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                Top 8 Endpoints
              </span>
            </div>

            <div className="relative">
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer appearance-none transition-colors"
              >
                {TOP_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {currentProviderConfig.description}
            </p>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                API Key
              </label>
              {currentProviderConfig.keyUrl && (
                <a
                  href={currentProviderConfig.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="password"
              placeholder={currentProviderConfig.placeholderKey}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Model Name & Dynamic Model Fetcher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                Model Selection
              </label>
              
              {/* Fetch Models Button */}
              <button
                type="button"
                onClick={handleManualFetchModels}
                disabled={isFetchingModels}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors disabled:opacity-50"
                title="Query the provider endpoint to fetch all available models"
              >
                {isFetchingModels ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Fetch Models</span>
                  </>
                )}
              </button>
            </div>

            {/* Model Input Mode: Dropdown vs Custom Text */}
            {!isCustomModelInput && availableModels.length > 0 ? (
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-medium text-slate-900 dark:text-slate-100 cursor-pointer appearance-none transition-colors"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                required
                placeholder="e.g. gemini-1.5-flash, gpt-4o-mini, hermes-3-llama-3.1-8b"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-slate-100"
              />
            )}

            {/* Status & Custom Toggle Row */}
            <div className="flex items-center justify-between mt-1.5 text-[11px]">
              <div>
                {modelsFetchStatus && (
                  <span className={`inline-flex items-center gap-1 ${
                    modelsFetchStatus.isFallback 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {modelsFetchStatus.isFallback ? (
                      <span>Curated list ({modelsFetchStatus.count} models). Enter key & click Fetch for live list.</span>
                    ) : (
                      <span>✓ {modelsFetchStatus.count} models fetched live from {currentProviderConfig.name}</span>
                    )}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCustomModelInput(!isCustomModelInput)}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-auto font-medium"
              >
                {isCustomModelInput ? '📋 Select from list' : '✏️ Enter custom ID'}
              </button>
            </div>
          </div>

          {/* API Base URL */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              API Base URL
            </label>
            <input
              type="text"
              placeholder={currentProviderConfig.defaultBaseUrl || 'https://api.openai.com/v1'}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>

          {/* Quick Tip */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Dynamic Model Fetching:</strong> Selecting an endpoint automatically attempts to load all models available on that server. Click <strong>Fetch Models</strong> anytime after updating your API key.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save AI Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
