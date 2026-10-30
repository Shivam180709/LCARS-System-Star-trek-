import React, { useState, useMemo } from 'react';
import { STAR_TREK_CANON_DATABASE, StarTrekCanonItem } from '../data/starTrekData';
import { 
  Rocket, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  List,
  ShieldAlert
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';

interface StarTrekCanonViewProps {
  onAskComputer?: (topic: string) => void;
}

export const StarTrekCanonView: React.FC<StarTrekCanonViewProps> = ({ onAskComputer }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<StarTrekCanonItem>(STAR_TREK_CANON_DATABASE[0]);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list');

  const categories = [
    { id: 'all', label: 'All Canon' },
    { id: 'technology', label: 'Warp, Transporters & Tech' },
    { id: 'species', label: 'Alien Species & Worlds' },
    { id: 'starships', label: 'Starfleet Starships' },
    { id: 'protocols', label: 'Prime Directive & Ethics' },
  ];

  const filteredItems = useMemo(() => {
    return STAR_TREK_CANON_DATABASE.filter((item) => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    });
  }, [selectedCategory]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    lcarsAudio.playBeep(750, 0.05);

    const matches = STAR_TREK_CANON_DATABASE.filter(
      (item) => catId === 'all' || item.category === catId
    );
    if (matches.length > 0) {
      setActiveItem(matches[0]);
    }
  };

  const handleSelectItem = (item: StarTrekCanonItem) => {
    setActiveItem(item);
    setMobileActiveView('detail');
    lcarsAudio.playBeep(920, 0.05);
  };

  // Next / Previous navigation within current filtered list
  const currentIdx = filteredItems.findIndex((it) => it.id === activeItem?.id);
  const handlePrevItem = () => {
    if (filteredItems.length === 0) return;
    const prevIdx = (currentIdx - 1 + filteredItems.length) % filteredItems.length;
    setActiveItem(filteredItems[prevIdx]);
    lcarsAudio.playBeep(700, 0.05);
  };

  const handleNextItem = () => {
    if (filteredItems.length === 0) return;
    const nextIdx = (currentIdx + 1) % filteredItems.length;
    setActiveItem(filteredItems[nextIdx]);
    lcarsAudio.playBeep(840, 0.05);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden font-sans p-2 sm:p-3 md:p-5 gap-2">
      {/* =========================================================================
          MOBILE VIEW SELECTOR TABS (Visible on screens < md)
          Allows user to effortlessly switch between Canon Index and Dossier Details
          ========================================================================= */}
      <div className="flex md:hidden items-center gap-1.5 p-1 bg-[#101220] rounded-xl border border-white/10 flex-shrink-0">
        <button
          onClick={() => {
            setMobileActiveView('list');
            lcarsAudio.playBeep(640, 0.05);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveView === 'list'
              ? 'bg-[#cc6699] text-white shadow-md'
              : 'text-[#cc99cc] hover:bg-white/5'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>CANON INDEX ({filteredItems.length})</span>
        </button>

        <button
          onClick={() => {
            setMobileActiveView('detail');
            lcarsAudio.playBeep(720, 0.05);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all truncate ${
            mobileActiveView === 'detail'
              ? 'bg-[#ff9900] text-black shadow-md'
              : 'text-[#ffaa00] hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="truncate">DOSSIER: {activeItem?.title || 'DETAILS'}</span>
        </button>
      </div>

      {/* Main Container: Two-column layout on Desktop, Tabbed on Mobile */}
      <div className="w-full flex-1 flex flex-col md:flex-row gap-3 overflow-hidden">
        {/* =========================================================================
            LEFT LIST COLUMN
            ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-88 flex flex-col bg-[#0b0c14] border-2 border-[#cc6699]/40 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 ${
            mobileActiveView === 'list' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="p-2.5 bg-[#18121e] border-b-2 border-[#cc6699] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-5 bg-[#cc6699] rounded-l" />
              <span className="font-bold text-xs text-[#ff9900] uppercase tracking-wider lcars-title">
                STARFLEET CANON ARCHIVE
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#99ccff]">
              {filteredItems.length} ENTRIES
            </span>
          </div>

          {/* Categories: Tapping ANY category immediately selects its first item */}
          <div className="flex gap-1.5 p-2 overflow-x-auto no-scrollbar border-b border-white/10 bg-[#100c14] flex-shrink-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase whitespace-nowrap rounded transition-colors ${
                    isSelected
                      ? 'bg-[#cc6699] text-white font-bold shadow'
                      : 'bg-[#1c1424] text-[#cc99cc] hover:bg-[#281a34]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
            {filteredItems.map((item) => {
              const isSelected = activeItem.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#ff9900] text-black border-[#ffaa00] font-bold shadow-md'
                      : 'bg-[#14101c] text-[#cc99cc] hover:bg-[#20182c] border-white/5'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`text-xs uppercase font-mono truncate ${
                        isSelected ? 'text-black' : 'text-[#ffaa00]'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {item.designation || item.affiliation}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-black text-white' : 'bg-purple-950 text-purple-300'
                      }`}
                    >
                      CANON
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-[#cc99cc]'}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            RIGHT DETAIL PANE
            ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-[#0b0c14] border-2 border-[#ff9900]/40 rounded-xl overflow-y-auto p-3 sm:p-4 md:p-5 shadow-2xl ${
            mobileActiveView === 'detail' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top Quick Navigation Bar (Back, Category Chips, Prev/Next) */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileActiveView('list');
                  lcarsAudio.playBeep(640, 0.05);
                }}
                className="md:hidden flex items-center gap-1 px-2.5 py-1 bg-[#cc6699] text-white font-mono font-bold text-xs uppercase rounded-lg shadow"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>CANON LIST</span>
              </button>

              <span className="hidden sm:inline-block px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-500/40 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                CANON FICTION
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-[#1a1c2e] text-[#cc99cc] border border-[#cc99cc]/40 rounded text-[10px] font-mono uppercase tracking-wider">
                {activeItem.affiliation || activeItem.category}
              </span>
            </div>

            {/* Prev / Next Navigator */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                onClick={handlePrevItem}
                title="Previous Entry"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1a1222] hover:bg-[#281a34] text-[#cc99cc] rounded border border-white/10 text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV</span>
              </button>

              <span className="text-[10px] text-gray-400 px-1">
                {currentIdx + 1} / {filteredItems.length}
              </span>

              <button
                onClick={handleNextItem}
                title="Next Entry"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1a1222] hover:bg-[#281a34] text-[#cc99cc] rounded border border-white/10 text-[11px]"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onAskComputer && (
                <button
                  onClick={() => onAskComputer(activeItem.title)}
                  className="flex items-center gap-1 ml-1 px-2.5 py-1 bg-[#ff9900] hover:bg-[#ffaa00] text-black font-bold text-[11px] uppercase rounded shadow"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>ASK AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Switcher Pills inside Detail View */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-white/5 flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-2 py-0.5 text-[9.5px] font-mono uppercase whitespace-nowrap rounded transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#cc6699] text-white font-bold'
                    : 'bg-[#181220] text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dossier Content */}
          <div className="space-y-3.5 flex-1 overflow-y-auto">
            {/* Header */}
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-[#ff9900] tracking-wide lcars-title leading-tight">
                {activeItem.title}
              </h2>
              <p className="text-xs font-mono text-[#99ccff] mt-0.5">{activeItem.designation}</p>
            </div>

            {/* Technical Specs Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeItem.technicalSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-2 sm:p-2.5 bg-[#141220] rounded-lg border border-white/10 font-mono"
                >
                  <div className="text-[9.5px] uppercase text-[#cc99cc] tracking-wider truncate">
                    {spec.label}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#ffaa00] mt-0.5 leading-snug">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Star Trek Canon Lore vs Real Scientific Fact Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 24th Century Canon */}
              <div className="p-3 bg-purple-950/20 rounded-xl border-l-4 border-[#cc6699] border-y border-r border-purple-500/20">
                <div className="flex items-center gap-1.5 text-[#cc6699] font-mono text-xs uppercase font-bold tracking-wider mb-1">
                  <Rocket className="w-3.5 h-3.5" />
                  <span>■ 24TH-CENTURY STAR TREK CANON LORE</span>
                </div>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
                  {activeItem.starTrekLore}
                </p>
              </div>

              {/* Real Scientific Reality */}
              <div className="p-3 bg-blue-950/20 rounded-xl border-l-4 border-[#3399cc] border-y border-r border-blue-500/20">
                <div className="flex items-center gap-1.5 text-[#3399cc] font-mono text-xs uppercase font-bold tracking-wider mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>■ REAL SCIENTIFIC DISTINCTION</span>
                </div>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
                  {activeItem.realScienceFact}
                </p>
              </div>
            </div>

            {/* Historical Milestone */}
            {activeItem.keyHistoricalMilestone && (
              <div className="p-2.5 bg-[#13111f] rounded-lg border border-white/10 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ffaa00] flex-shrink-0" />
                <div className="text-xs font-mono text-gray-300">
                  <strong className="text-[#ff9900] uppercase">
                    FEDERATION HISTORICAL RECORD:
                  </strong>{' '}
                  {activeItem.keyHistoricalMilestone}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
