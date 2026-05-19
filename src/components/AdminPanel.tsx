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
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Logo (URL)</label>
                <input 
                  type="text" 
                  value={localConfig.logoUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Site Background Color</label>
                <div className="flex gap-4">
                  <input 
                    type="color" 
                    value={localConfig.backgroundColor}
                    onChange={(e) => setLocalConfig({ ...localConfig, backgroundColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={localConfig.backgroundColor}
                    onChange={(e) => setLocalConfig({ ...localConfig, backgroundColor: e.target.value })}
                    className="flex-1 p-3 border rounded-lg uppercase"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {localConfig.pages.map((page, idx) => {
                const isSpecialPage = page.id === 2 || page.id === 5;
                return (
                  <div key={page.id} className="p-6 border rounded-xl space-y-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">Page {idx + 1}: {page.title || (page.id === 2 ? 'About' : '')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isSpecialPage ? (
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-bold text-gray-400">TEXT CONTENT</label>
                          <textarea 
                            value={page.description}
                            onChange={(e) => updatePage(page.id, { description: e.target.value })}
                            className="w-full p-2 border rounded h-32 resize-none"
                            placeholder="Enter text here..."
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400">TITLE</label>
                          <textarea 
                            value={page.title}
                            onChange={(e) => updatePage(page.id, { title: e.target.value })}
                            className="w-full p-2 border rounded h-12 resize-none"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">MEDIA URL</label>
                        <input 
                          type="text" 
                          value={page.mediaUrl}
                          onChange={(e) => updatePage(page.id, { mediaUrl: e.target.value })}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>

                    {!isSpecialPage && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">DESCRIPTION</label>
                        <textarea 
                          value={page.description}
                          onChange={(e) => updatePage(page.id, { description: e.target.value })}
                          className="w-full p-2 border rounded h-20 resize-none"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {isSpecialPage ? (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400">COLOR</label>
                            <input 
                              type="color" 
                              value={page.styles.descriptionColor}
                              onChange={(e) => updatePageStyle(page.id, { descriptionColor: e.target.value })}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400">SIZE</label>
                            <select 
                              value={page.styles.descriptionSize}
                              onChange={(e) => updatePageStyle(page.id, { descriptionSize: e.target.value })}
                              className="w-full p-1 border rounded text-xs"
                            >
                              <option value="text-sm">X-Small</option>
                              <option value="text-base">Small</option>
                              <option value="text-lg">Medium</option>
                              <option value="text-xl">Large</option>
                              <option value="text-2xl">X-Large</option>
                              <option value="text-4xl">Huge</option>
                              <option value="text-6xl">Heading</option>
                              <option value="text-8xl">Giant</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400">TITLE COLOR</label>
                            <input 
                              type="color" 
                              value={page.styles.titleColor}
                              onChange={(e) => updatePageStyle(page.id, { titleColor: e.target.value })}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400">DESC COLOR</label>
                            <input 
                              type="color" 
                              value={page.styles.descriptionColor}
                              onChange={(e) => updatePageStyle(page.id, { descriptionColor: e.target.value })}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                        </>
                      )}
                      
                      {!isSpecialPage && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400">TITLE SIZE</label>
                          <select 
                            value={page.styles.titleSize}
                            onChange={(e) => updatePageStyle(page.id, { titleSize: e.target.value })}
                            className="w-full p-1 border rounded text-xs"
                          >
                            <option value="text-4xl">Small</option>
                            <option value="text-6xl">Medium</option>
                            <option value="text-8xl">Large</option>
                            <option value="text-[12rem]">Extra Large</option>
                          </select>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">MEDIA TYPE</label>
                        <select 
                          value={page.mediaType}
                          onChange={(e) => updatePage(page.id, { mediaType: e.target.value as 'image' | 'video' })}
                          className="w-full p-1 border rounded text-xs"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">FONT FAMILY</label>
                        <select 
                          value={page.styles.fontFamily}
                          onChange={(e) => updatePageStyle(page.id, { fontFamily: e.target.value })}
                          className="w-full p-1 border rounded text-xs"
                        >
                          <option value="font-sans">Outfit (Sans)</option>
                          <option value="font-display">Space Grotesk (Display)</option>
                          <option value="font-inter">Inter (Modern)</option>
                          <option value="font-serif">Playfair Display (Serif)</option>
                          <option value="font-mono">JetBrains Mono (Technical)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400">EXTERNAL LINK (GOOGLE DRIVE etc.)</label>
                      <input 
                        type="text" 
                        value={page.externalLink || ''}
                        onChange={(e) => updatePage(page.id, { externalLink: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="https://drive.google.com/..."
                      />
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
