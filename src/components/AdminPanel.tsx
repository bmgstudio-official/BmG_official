import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSite } from '../context/SiteContext';
import { X, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { PageConfig } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { config, updateConfig, resetConfig } = useSite();
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState<'general' | 'pages'>('general');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(localConfig);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const updatePage = (id: number, updates: Partial<PageConfig>) => {
    setLocalConfig({
      ...localConfig,
      pages: localConfig.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const updatePageStyle = (id: number, styleUpdates: Partial<PageConfig['styles']>) => {
    setLocalConfig({
      ...localConfig,
      pages: localConfig.pages.map((p) => 
        p.id === id ? { ...p, styles: { ...p.styles, ...styleUpdates } } : p
      ),
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-end p-4 sm:p-8"
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden text-black"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'general' ? 'border-b-2 border-black bg-white' : 'bg-gray-50 text-gray-500 hover:text-black'}`}
          >
            General Settings
          </button>
          <button 
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'pages' ? 'border-b-2 border-black bg-white' : 'bg-gray-50 text-gray-500 hover:text-black'}`}
          >
            Page Management
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeTab === 'general' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">Identity</span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-gray-700">Logo URL</label>
                  <input 
                    type="text" 
                    value={localConfig.logoUrl}
                    onChange={(e) => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">Canvas Settings</span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-gray-700">Global Background Color</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={localConfig.backgroundColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, backgroundColor: e.target.value })}
                      className="w-14 h-14 rounded-lg cursor-pointer border-2 border-white shadow-sm"
                    />
                    <input 
                      type="text" 
                      value={localConfig.backgroundColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, backgroundColor: e.target.value })}
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg uppercase font-mono text-sm tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {localConfig.pages.map((page, idx) => {
                const isFullTextPage = page.id === 2 || page.id === 5;
                return (
                  <div key={page.id} className="group relative p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="absolute -top-3 -left-3 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {idx + 1}
                    </div>
                    
                    <div className="mb-6 flex justify-between items-end border-b pb-4">
                      <div>
                        <h3 className="font-bold text-xl tracking-tight text-gray-900 line-clamp-1">
                          {page.title || (page.id === 1 ? 'Hero' : page.id === 2 ? 'About' : page.id === 5 ? 'Connect' : 'Untitled')}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                          {page.id === 1 ? 'Hero Page' : page.id === 2 ? 'Narrative Page' : page.id === 5 ? 'Connect Page' : page.mediaType === 'video' ? 'Video Page' : 'Media Page'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Text Content Area */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text Content</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">TITLE / HEADING</label>
                            <textarea 
                              value={page.title}
                              onChange={(e) => updatePage(page.id, { title: e.target.value })}
                              className="w-full p-3 bg-white border border-gray-200 rounded-lg h-16 resize-none text-sm font-bold"
                              placeholder="Leave empty to hide..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">DESCRIPTION / CONTENT</label>
                            <textarea 
                              value={page.description}
                              onChange={(e) => updatePage(page.id, { description: e.target.value })}
                              className="w-full p-3 bg-white border border-gray-200 rounded-lg h-32 md:h-16 resize-none text-sm leading-relaxed"
                              placeholder="Enter content here..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Visual & Style Area */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Styles</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">TEXT COLOR</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={isFullTextPage ? page.styles.descriptionColor : page.styles.titleColor}
                                onChange={(e) => updatePageStyle(page.id, isFullTextPage ? { descriptionColor: e.target.value } : { titleColor: e.target.value })}
                                className="w-8 h-8 rounded shrink-0 cursor-pointer border border-gray-200"
                              />
                              <input 
                                type="text"
                                value={isFullTextPage ? page.styles.descriptionColor : page.styles.titleColor}
                                onChange={(e) => updatePageStyle(page.id, isFullTextPage ? { descriptionColor: e.target.value } : { titleColor: e.target.value })}
                                className="w-full text-[10px] font-mono border rounded px-1 uppercase"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">TEXT SIZE</label>
                            <select 
                              value={isFullTextPage ? page.styles.descriptionSize : page.styles.titleSize}
                              onChange={(e) => updatePageStyle(page.id, isFullTextPage ? { descriptionSize: e.target.value } : { titleSize: e.target.value })}
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                            >
                              <option value="text-sm">X-Small</option>
                              <option value="text-base">Small</option>
                              <option value="text-lg">Medium</option>
                              <option value="text-xl">Large</option>
                              <option value="text-2xl">X-Large</option>
                              <option value="text-4xl">Huge</option>
                              <option value="text-6xl">Heading</option>
                              <option value="text-8xl">Giant</option>
                              <option value="text-[12rem]">Monster</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">FONT FAMILY</label>
                            <select 
                              value={page.styles.fontFamily}
                              onChange={(e) => updatePageStyle(page.id, { fontFamily: e.target.value })}
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                            >
                              <option value="font-sans">Outfit (Modern)</option>
                              <option value="font-display">Space Grotesk (Tech)</option>
                              <option value="font-inter">Inter (Default)</option>
                              <option value="font-serif">Playfair Display (Serif)</option>
                              <option value="font-mono">JetBrains Mono (Code)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">MEDIA TYPE</label>
                            <select 
                              value={page.mediaType}
                              onChange={(e) => updatePage(page.id, { mediaType: e.target.value as 'image' | 'video' })}
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                            >
                              <option value="image">Image Asset</option>
                              <option value="video">Video Loop</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Assets Area */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Links & Assets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">MEDIA SRC (IMAGE OR VIDEO URL)</label>
                            <input 
                              type="text" 
                              value={page.mediaUrl}
                              onChange={(e) => updatePage(page.id, { mediaUrl: e.target.value })}
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600">EXTERNAL CTA (ACTION URL)</label>
                            <input 
                              type="text" 
                              value={page.externalLink || ''}
                              onChange={(e) => updatePage(page.id, { externalLink: e.target.value })}
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                              placeholder="https://gmail.com or https://vimeo.com/..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-4">
          <button 
            onClick={resetConfig}
            className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold"
          >
            <RotateCcw size={18} />
            Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-bold shadow-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save size={18} className={isSaving ? 'animate-pulse' : ''} />
            {isSaving ? 'Saving...' : 'Apply Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
