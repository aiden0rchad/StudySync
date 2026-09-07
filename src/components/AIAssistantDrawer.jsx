import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  Settings, 
  CheckCircle2, 
  Calendar, 
  AlertCircle,
  Paperclip,
  Loader2,
  Trash2,
  HelpCircle,
  Bot,
  User
} from 'lucide-react';
import { sendAIChatMessage, fetchAISettings } from '../utils/api';

export default function AIAssistantDrawer({ 
  isOpen, 
  onClose, 
  onOpenSettings,
  onScheduleChanged
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm your StudySync AI Assistant.\n\nYou can tell me to schedule classes, add homework, or upload pictures/screenshots of your syllabus and assignment sheets so I can extract and add them automatically!`,
      actions: []
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { base64, mimeType, name }
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSettings, setActiveSettings] = useState({ provider: 'gemini', model: 'gemini-1.5-flash' });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      fetchAISettings().then(s => {
        if (s) {
          setActiveSettings({
            provider: s.ai_provider || 'gemini',
            model: s.ai_model || 'gemini-1.5-flash'
          });
        }
      });
    }
  }, [isOpen, messages, isLoading]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        base64: reader.result,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSend = async (customText = null) => {
    const textToSend = customText || input.trim();
    if (!textToSend && !selectedImage) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend || 'Please analyze this schedule/syllabus image.',
      image: selectedImage?.base64,
      imageName: selectedImage?.name
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await sendAIChatMessage({
        message: userMsg.content,
        imageBase64: imagePayload?.base64,
        imageMimeType: imagePayload?.mimeType,
        history: historyPayload
      });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        actions: res.actionsTaken || [],
        needsConfig: res.needsConfig
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If actions were taken, refresh the calendar view!
      if (res.actionsTaken && res.actionsTaken.length > 0 && onScheduleChanged) {
        onScheduleChanged();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message}. If you haven't set an API key yet, click the settings gear at top right.`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🎮 Discord ADHD Nudge', text: 'Send an anti-procrastination ADHD nudge to Discord for my most urgent assignment' },
    { label: '🌶️ Spicy Discord Roast', text: 'Send a spicy Discord roast to motivate me to finish my homework' },
    { label: '📅 Today’s Schedule', text: 'What classes and assignments do I have today?' },
    { label: '➕ Add Homework', text: 'Add homework: Physics Lab Report due this Friday 5pm' },
    { label: '📝 Schedule Class', text: 'Add class: BIO 101 on Mon, Wed 11am to 12:30pm in Room 102 with Dr. Miller' },
    { label: '✅ Mark Complete', text: 'Mark my next pending homework as completed' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
        
        {/* Drawer Header */}
        <div className="px-5 py-3.5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">StudySync AI</h3>
                <span className="text-[10px] font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/80 max-w-[180px] truncate" title={`${activeSettings.provider}: ${activeSettings.model}`}>
                  {activeSettings.provider}: {activeSettings.model}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multimodal Schedule Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="AI & API Key Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-40 bg-indigo-600/10 dark:bg-indigo-950/40 border-2 border-dashed border-indigo-500 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl shadow-xl border border-indigo-200 dark:border-indigo-700 text-center">
              <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Drop syllabus or schedule picture here</p>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
                }`}>
                  {/* Attached user image thumbnail if any */}
                  {msg.image && (
                    <div className="rounded-xl overflow-hidden border border-white/20 mb-2 max-h-48">
                      <img src={msg.image} alt={msg.imageName || 'Uploaded'} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {/* Actions Taken Badges */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-1 pb-1">
                      {msg.actions.map((act, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Config Button if needed */}
                  {msg.needsConfig && (
                    <button
                      onClick={onOpenSettings}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Configure AI Settings
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Analyzing and updating calendar...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(qp.text)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap transition-colors shadow-2xs"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800 shrink-0">
                <img src={selectedImage.base64} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                  {selectedImage.name}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400">Photo attached for AI analysis</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Footer */}
        <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {/* Image attachment button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Attach picture of syllabus or homework sheet"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Text input */}
            <input
              type="text"
              placeholder={selectedImage ? "Add instructions for this photo..." : "Type instructions or ask anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
              title="Send to AI Assistant"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
