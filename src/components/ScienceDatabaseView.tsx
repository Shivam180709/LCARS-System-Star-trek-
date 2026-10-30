import React, { useState, useMemo } from 'react';
import { SCIENCE_DATABASE, ScienceTopic } from '../data/scienceData';
import { 
  Search, 
  Atom, 
  Sparkles, 
  Orbit, 
  ChevronRight, 
  ChevronLeft,
  List,
  FileText
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';

interface ScienceDatabaseViewProps {
  onAskComputer?: (topic: string) => void;
}

export const ScienceDatabaseView: React.FC<ScienceDatabaseViewProps> = ({ onAskComputer }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<ScienceTopic>(SCIENCE_DATABASE[0]);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list');

  const categories = [
    { id: 'all', label: 'All Databases' },
    { id: 'astronomy', label: 'Astronomy & Moons' },
    { id: 'exoplanets', label: 'Exoplanets' },
    { id: 'physics', label: 'Physics & Antimatter' },
    { id: 'earth_biology', label: 'Earth Flora & Spices' },
    { id: 'space_exploration', label: 'Missions & JWST' },
  ];

  const filteredTopics = useMemo(() => {
    return SCIENCE_DATABASE.filter((topic) => {
      const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesSearch =
        topic.title.toLowerCase().includes(q) ||
        topic.subtitle.toLowerCase().includes(q) ||
        topic.realScience.toLowerCase().includes(q) ||
        topic.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // When category changes, select the first matching topic so detail immediately shows it
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    lcarsAudio.playBeep(800, 0.05);

    const matches = SCIENCE_DATABASE.filter(
      (topic) => catId === 'all' || topic.category === catId
    );
    if (matches.length > 0) {
      setActiveTopic(matches[0]);
    }
  };

  const handleSelectTopic = (topic: ScienceTopic) => {
    setActiveTopic(topic);
    setMobileActiveView('detail');
    lcarsAudio.playBeep(940, 0.05);
  };

  // Next / Previous navigation within current filtered list
  const currentIdx = filteredTopics.findIndex((t) => t.id === activeTopic?.id);
  const handlePrevTopic = () => {
    if (filteredTopics.length === 0) return;
    const prevIdx = (currentIdx - 1 + filteredTopics.length) % filteredTopics.length;
    setActiveTopic(filteredTopics[prevIdx]);
    lcarsAudio.playBeep(720, 0.05);
  };

  const handleNextTopic = () => {
    if (filteredTopics.length === 0) return;
    const nextIdx = (currentIdx + 1) % filteredTopics.length;
    setActiveTopic(filteredTopics[nextIdx]);
    lcarsAudio.playBeep(820, 0.05);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden font-sans p-2 sm:p-3 md:p-5 gap-2">
      {/* =========================================================================
          MOBILE VIEW SELECTOR TABS (Visible on screens < md)
          Allows user to effortlessly switch between Archives List and Record Details
          ========================================================================= */}
      <div className="flex md:hidden items-center gap-1.5 p-1 bg-[#101220] rounded-xl border border-white/10 flex-shrink-0">
        <button
          onClick={() => {
            setMobileActiveView('list');
            lcarsAudio.playBeep(640, 0.05);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveView === 'list'
              ? 'bg-[#3399cc] text-black shadow-md'
              : 'text-[#99ccff] hover:bg-white/5'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>ARCHIVES ({filteredTopics.length})</span>
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
          <FileText className="w-3.5 h-3.5" />
          <span className="truncate">RECORD: {activeTopic?.title || 'DETAILS'}</span>
        </button>
      </div>

      {/* Main Container: Two-column layout on Desktop/Landscape, Tabbed on Mobile/Portrait */}
      <div className="w-full flex-1 flex flex-col md:flex-row gap-3 overflow-hidden">
        {/* =========================================================================
            LEFT COLUMN: SEARCH, CATEGORIES & TOPIC LIST
            ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col bg-[#0b0c14] border-2 border-[#3366cc]/40 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 ${
            mobileActiveView === 'list' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="p-2.5 bg-[#121424] border-b-2 border-[#3399cc] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-5 bg-[#3399cc] rounded-l" />
              <span className="font-bold text-xs text-[#ff9900] uppercase tracking-wider lcars-title">
                STARFLEET SCIENCE ARCHIVE
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#cc99cc]">
              {filteredTopics.length} RECORDS
            </span>
          </div>

          {/* Search bar */}
          <div className="p-2 border-b border-white/10 bg-black/50 flex-shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#99ccff] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search planets, flora, physics, missions..."
                className="w-full bg-[#161726] text-xs font-mono text-[#ffaa00] placeholder-gray-500 pl-8 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#3399cc]"
              />
            </div>
          </div>

          {/* Category Tabs: Tapping ANY category immediately filters & updates the record */}
          <div className="flex gap-1.5 p-2 overflow-x-auto no-scrollbar border-b border-white/10 bg-[#0e0f1a] flex-shrink-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase whitespace-nowrap rounded transition-colors ${
                    isSelected
                      ? 'bg-[#3399cc] text-black font-bold shadow'
                      : 'bg-[#181a2c] text-[#99ccff] hover:bg-[#252840]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Topic List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
            {filteredTopics.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#ff9900] text-black border-[#ffaa00] font-bold shadow-md'
                      : 'bg-[#121320] text-[#99ccff] hover:bg-[#1a1c30] border-white/5'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`text-xs uppercase font-mono truncate ${
                        isSelected ? 'text-black' : 'text-[#ffaa00]'
                      }`}
                    >
                      {topic.title}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {topic.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="md:hidden text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-[#ffaa00]">
                      VIEW
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-[#cc99cc]'}`}
                    />
                  </div>
                </button>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="p-4 text-center text-xs font-mono text-gray-500">
                NO RECORDS MATCHING CURRENT SEARCH CRITERIA
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: DETAILED SCIENTIFIC BREAKDOWN
            ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-[#0b0c14] border-2 border-[#ff9900]/40 rounded-xl overflow-y-auto p-3 sm:p-4 md:p-5 shadow-2xl ${
            mobileActiveView === 'detail' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top Quick Navigation Bar (Back, Category Chips, Prev/Next) */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10 flex-shrink-0">
            {/* Mobile Back to List Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileActiveView('list');
                  lcarsAudio.playBeep(640, 0.05);
                }}
                className="md:hidden flex items-center gap-1 px-2.5 py-1 bg-[#3399cc] text-black font-mono font-bold text-xs uppercase rounded-lg shadow transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>ARCHIVE LIST</span>
              </button>

              <span className="hidden sm:inline-block px-2 py-0.5 bg-[#1a1c2e] text-[#cc99cc] border border-[#cc99cc]/40 rounded text-[10px] font-mono uppercase tracking-wider">
                CAT: {activeTopic.category.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Prev / Next Navigator */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                onClick={handlePrevTopic}
                title="Previous Record"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#161726] hover:bg-[#252840] text-[#99ccff] rounded border border-white/10 text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV</span>
              </button>

              <span className="text-[10px] text-gray-400 px-1">
                {currentIdx + 1} / {filteredTopics.length}
              </span>

              <button
                onClick={handleNextTopic}
                title="Next Record"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#161726] hover:bg-[#252840] text-[#99ccff] rounded border border-white/10 text-[11px]"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onAskComputer && (
                <button
                  onClick={() => onAskComputer(activeTopic.title)}
                  className="flex items-center gap-1 ml-1 px-2.5 py-1 bg-[#ff9900] hover:bg-[#ffaa00] text-black font-bold text-[11px] uppercase rounded shadow"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>ASK AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Switcher Pills right in Detail View */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-white/5 flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-2 py-0.5 text-[9.5px] font-mono uppercase whitespace-nowrap rounded transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#ff9900] text-black font-bold'
                    : 'bg-[#141524] text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Detailed Content */}
          {activeTopic ? (
            <div className="space-y-3.5 flex-1 overflow-y-auto">
              {/* Header info */}
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-[#ff9900] tracking-wide lcars-title leading-tight">
                  {activeTopic.title}
                </h2>
                <p className="text-xs font-mono text-[#99ccff] mt-0.5">{activeTopic.subtitle}</p>
              </div>

              {/* Key Facts Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeTopic.keyFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-2 sm:p-2.5 bg-[#121424] rounded-lg border border-white/10 font-mono"
                  >
                    <div className="text-[9.5px] uppercase text-[#cc99cc] tracking-wider truncate">
                      {fact.label}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#ffaa00] mt-0.5">
                      {fact.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Real Science vs Canon Dual Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Real-World Science */}
                <div className="p-3 bg-blue-950/20 rounded-xl border-l-4 border-[#3399cc] border-y border-r border-blue-500/20">
                  <div className="flex items-center gap-1.5 text-[#3399cc] font-mono text-xs uppercase font-bold tracking-wider mb-1">
                    <Atom className="w-3.5 h-3.5" />
                    <span>■ REAL-WORLD SCIENCE BREAKDOWN</span>
                  </div>
                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
                    {activeTopic.realScience}
                  </p>
                </div>

                {/* Star Trek Canon Parallel */}
                {activeTopic.starTrekCanon && (
                  <div className="p-3 bg-amber-950/20 rounded-xl border-l-4 border-[#ff9900] border-y border-r border-amber-500/20">
                    <div className="flex items-center gap-1.5 text-[#ff9900] font-mono text-xs uppercase font-bold tracking-wider mb-1">
                      <Orbit className="w-3.5 h-3.5" />
                      <span>■ STAR TREK 24TH-CENTURY APPLICATION</span>
                    </div>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
                      {activeTopic.starTrekCanon}
                    </p>
                  </div>
                )}
              </div>

              {/* Deep Dive Science Section */}
              <div className="p-3 bg-[#111322] rounded-xl border border-white/10 space-y-1">
                <div className="text-xs font-mono uppercase tracking-wider text-[#cc99cc] font-bold">
                  PHYSICAL ANALYSIS & OBSERVATIONAL DATA
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  {activeTopic.deepDive}
                </p>
                {activeTopic.relatedTrekTech && (
                  <div className="pt-1 text-xs font-mono text-[#99ccff]">
                    <strong className="text-[#ff9900]">Related Starfleet System:</strong>{' '}
                    {activeTopic.relatedTrekTech}
                  </div>
                )}
              </div>

              {/* Cross-Index Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase mr-1">
                  Cross-Index:
                </span>
                {activeTopic.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[#181a2e] text-[#cc99cc] rounded-full text-[10px] font-mono border border-purple-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-mono text-xs">
              SELECT A SCIENTIFIC RECORD TO INSPECT DIAGNOSTICS
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
