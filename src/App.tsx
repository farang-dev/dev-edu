import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { curriculumData, type Topic } from "./data/curriculum";
import { 
  Sparkles, 
  Bookmark, 
  Search, 
  ChevronRight, 
  Terminal, 
  Copy, 
  Check, 
  BookOpen,
  Layout,
  Server,
  Shield,
  Cpu,
  BookOpenCheck,
  Clock,
  Award,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const [selectedDomainId, setSelectedDomainId] = useState("frontend");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const activeDomain = curriculumData.find((d) => d.id === selectedDomainId) || curriculumData[0];

  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem("dev-edu-bookmarks");
    if (saved) {
      try {
        setBookmarkedTopicIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  // Load theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("dev-edu-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  // Sync theme attribute and save
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dev-edu-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Sync selected module and topic when domain changes
  useEffect(() => {
    if (activeDomain && activeDomain.modules.length > 0) {
      const firstModule = activeDomain.modules[0];
      setSelectedModuleId(firstModule.id);
      if (firstModule.topics.length > 0) {
        setSelectedTopic(firstModule.topics[0]);
      } else {
        setSelectedTopic(undefined);
      }
    } else {
      setSelectedModuleId("");
      setSelectedTopic(undefined);
    }
  }, [selectedDomainId]);

  // Auto-focus active rail tab on mount & domain change
  useEffect(() => {
    const idx = curriculumData.findIndex(d => d.id === selectedDomainId);
    railTabRefs.current[idx]?.focus();
  }, [selectedDomainId]);

  // Sync topic when selected module changes
  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const targetModule = activeDomain.modules.find(m => m.id === moduleId);
    if (targetModule && targetModule.topics.length > 0) {
      setSelectedTopic(targetModule.topics[0]);
    } else {
      setSelectedTopic(undefined);
    }
  };

  // Save bookmarks
  const toggleBookmark = (topicId: string) => {
    const updated = bookmarkedTopicIds.includes(topicId)
      ? bookmarkedTopicIds.filter((id) => id !== topicId)
      : [...bookmarkedTopicIds, topicId];
    
    setBookmarkedTopicIds(updated);
    localStorage.setItem("dev-edu-bookmarks", JSON.stringify(updated));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const railTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRef = useRef<HTMLElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElement>(null);

  const zoneOrder = ["rail", "modules", "topics", "canvas"] as const;

  const getCurrentZone = (): (typeof zoneOrder)[number] | null => {
    const el = document.activeElement;
    if (!el) return null;
    if (railRef.current?.contains(el)) return "rail";
    if (modulesRef.current?.contains(el)) return "modules";
    if (topicsRef.current?.contains(el)) return "topics";
    if (canvasRef.current?.contains(el)) return "canvas";
    return null;
  };

  const focusZone = (zone: (typeof zoneOrder)[number]) => {
    switch (zone) {
      case "rail": {
        const idx = curriculumData.findIndex(d => d.id === selectedDomainId);
        railTabRefs.current[Math.max(0, idx)]?.focus();
        break;
      }
      case "modules": {
        const input = modulesRef.current?.querySelector<HTMLInputElement>(".search-input");
        if (input && input !== document.activeElement) { input.focus(); return; }
        const first = modulesRef.current?.querySelector<HTMLButtonElement>(".module-item-btn");
        first?.focus();
        break;
      }
      case "topics": {
        const first = topicsRef.current?.querySelector<HTMLButtonElement>(".topic-item-btn");
        first?.focus();
        break;
      }
      case "canvas": {
        const btn = canvasRef.current?.querySelector<HTMLButtonElement>("button");
        btn?.focus();
        break;
      }
    }
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    const zone = getCurrentZone();
    if (!zone) return;

    // Left / Right between zones
    const idx = zoneOrder.indexOf(zone);
    if (e.key === "ArrowRight" && idx < zoneOrder.length - 1) {
      e.preventDefault();
      focusZone(zoneOrder[idx + 1]);
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusZone(zoneOrder[idx - 1]);
      return;
    }

    // Up / Down within rail
    if (zone === "rail") {
      const dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const cur = curriculumData.findIndex(d => d.id === selectedDomainId);
      const next = cur + dir;
      if (next < 0 || next >= curriculumData.length) return;
      railTabRefs.current[next]?.focus();
      setSelectedDomainId(curriculumData[next].id);
      return;
    }

    // Up / Down within modules list
    if (zone === "modules") {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const dir = e.key === "ArrowDown" ? 1 : -1;
        const items = modulesRef.current?.querySelectorAll<HTMLButtonElement>(".module-item-btn");
        if (!items || items.length === 0) return;
        const cur = Array.from(items).findIndex(b => b === document.activeElement);
        const next = cur + dir;
        if (next < 0 || next >= items.length) return;
        e.preventDefault();
        items[next].focus();
        handleModuleSelect(items[next].dataset.moduleId ?? "");
      }
      return;
    }

    // Up / Down within topics list
    if (zone === "topics") {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const dir = e.key === "ArrowDown" ? 1 : -1;
        const items = topicsRef.current?.querySelectorAll<HTMLButtonElement>(".topic-item-btn");
        if (!items || items.length === 0) return;
        const cur = Array.from(items).findIndex(b => b === document.activeElement);
        const next = cur + dir;
        if (next < 0 || next >= items.length) return;
        e.preventDefault();
        items[next].focus();
        setSelectedTopic(activeModuleTopics[next]);
      }
      return;
    }
  };

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case "Layout": return <Layout className="h-5 w-5" />;
      case "Server": return <Server className="h-5 w-5" />;
      case "Shield": return <Shield className="h-5 w-5" />;
      case "Cpu": return <Cpu className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  // Filter modules and topics based on search
  const getFilteredData = () => {
    if (!searchQuery.trim()) {
      return {
        modules: activeDomain.modules,
        activeModuleTopics: activeDomain.modules.find(m => m.id === selectedModuleId)?.topics || []
      };
    }

    const query = searchQuery.toLowerCase();
    
    // Filter modules that contain matching topics or match the module title themselves
    const filteredModules = activeDomain.modules.map(mod => {
      const matchingTopics = mod.topics.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        topic.shortDesc.toLowerCase().includes(query) ||
        topic.tags.some(tag => tag.toLowerCase().includes(query)) ||
        topic.content.toLowerCase().includes(query)
      );
      
      return {
        ...mod,
        topics: matchingTopics
      };
    }).filter(mod => mod.topics.length > 0 || mod.title.toLowerCase().includes(query));

    // Get topics of the currently selected module from the filtered list
    const currentFilteredMod = filteredModules.find(m => m.id === selectedModuleId);
    const activeModuleTopics = currentFilteredMod ? currentFilteredMod.topics : [];

    return {
      modules: filteredModules,
      activeModuleTopics
    };
  };

  const { modules: filteredModules, activeModuleTopics } = getFilteredData();

  return (
    <div className="app-container" onKeyDown={handleContainerKeyDown}>
      {/* 1. PILLAR RAIL (LEFTMOST NAVIGATION) */}
      <aside className="pillar-rail">
        <div className="rail-logo">
          <div className="logo-box">
            <Sparkles className="logo-icon" />
          </div>
          <span className="logo-text text-micro">DevEdu</span>
        </div>

        <nav className="rail-nav" role="tablist" aria-label="Pillars" ref={railRef}>
          {curriculumData.map((domain, i) => (
            <button
              key={domain.id}
              ref={(el) => { railTabRefs.current[i] = el; }}
              role="tab"
              aria-selected={selectedDomainId === domain.id}
              onClick={() => setSelectedDomainId(domain.id)}
              className={`rail-tab-btn ${selectedDomainId === domain.id ? "active" : ""}`}
              title={domain.title}
            >
              <div className="rail-icon-wrapper">
                {getDomainIcon(domain.iconName)}
              </div>
              <span className="rail-label text-micro">{domain.title}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          className="rail-tab-btn theme-toggle"
          style={{ marginTop: "auto", marginBottom: "1rem" }}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <div className="rail-icon-wrapper">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
          <span className="rail-label text-micro">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </aside>

      {/* 2. SIDEBAR - 2 COLUMN CONFIGURATION */}
      <div className="sidebar-container">
        {/* Column 1: Subcategories (Modules) */}
        <div className="sidebar-col-modules" ref={modulesRef}>
          <div className="col-header">
            <h2 className="col-title text-micro">Subcategories</h2>
          </div>
          
          <div className="search-bar-wrapper">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="modules-list">
            {filteredModules.length > 0 ? (
              filteredModules.map((mod) => (
                <button
                  key={mod.id}
                  data-module-id={mod.id}
                  onClick={() => handleModuleSelect(mod.id)}
                  className={`module-item-btn ${selectedModuleId === mod.id ? "active" : ""}`}
                >
                  <div className="module-item-content">
                    <span className="module-title">{mod.title}</span>
                    <span className="module-count text-micro">
                      {mod.topics.length} {mod.topics.length === 1 ? "topic" : "topics"}
                    </span>
                  </div>
                  <ChevronRight className="chevron-icon" />
                </button>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-text text-micro">No subcategories</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Topics List */}
        <div className="sidebar-col-topics">
          <div className="col-header">
            <h2 className="col-title text-micro">Topics</h2>
          </div>

          <div className="topics-list" ref={topicsRef}>
            {activeModuleTopics.length > 0 ? (
              activeModuleTopics.map((topic) => {
                const isSelected = selectedTopic?.id === topic.id;
                const isBookmarked = bookmarkedTopicIds.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={`topic-item-btn ${isSelected ? "active" : ""} ${topic.difficulty}`}
                  >
                    <div className="topic-item-content">
                      <div className="topic-title-row">
                        <span className="topic-title">{topic.title}</span>
                        {isBookmarked && <Bookmark className="bookmark-icon" />}
                      </div>
                      <div className="topic-meta-row">
                        <span className={`difficulty-badge text-micro ${topic.difficulty}`}>
                          {topic.difficulty}
                        </span>
                        <span className="read-time text-micro">
                          <Clock className="meta-icon" /> {topic.readTimeMin}m
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-state">
                <span className="empty-text text-micro">
                  {searchQuery ? "No matches in this section" : "Select a subcategory"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. READING CANVAS (RIGHT SIDE) */}
      <main className="reading-canvas" ref={canvasRef}>
        <div className="reading-container-limiter">
          {selectedTopic ? (
            <article className="reading-article animate-fade">
              {/* Breadcrumb */}
              <div className="article-meta-header">
                <span className="domain-label text-micro">
                  {activeDomain.title}
                </span>
                <ChevronRight className="meta-arrow" />
                <span className="module-label text-micro">
                  {activeDomain.modules.find(m => m.id === selectedModuleId)?.title}
                </span>
              </div>

              {/* Title & Actions */}
              <div className="article-title-row">
                <h1 className="article-title">{selectedTopic.title}</h1>
                
                <button
                  onClick={() => toggleBookmark(selectedTopic.id)}
                  className={`bookmark-toggle-btn ${
                    bookmarkedTopicIds.includes(selectedTopic.id) ? "active" : ""
                  }`}
                  title="Bookmark Topic"
                >
                  <Bookmark className="bookmark-btn-icon" />
                </button>
              </div>

              {/* Description */}
              <p className="article-desc">{selectedTopic.shortDesc}</p>

              {/* Tags */}
              <div className="article-tags-container">
                {selectedTopic.tags.map((tag) => (
                  <span key={tag} className="tag-badge text-micro">{tag}</span>
                ))}
              </div>

              {/* Key Points */}
              <div className="concepts-summary-card">
                <h3 className="card-section-title text-micro">
                  <Award className="card-section-icon" />
                  Key Points & Specifications
                </h3>
                <ul className="concepts-list">
                  {selectedTopic.keyPoints.map((point, i) => (
                    <li key={i} className="concept-item text-xs">
                      <span className="bullet-dot" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deep-Dive Content */}
              <div className="article-essay-section">
                <h3 className="section-label text-micro">Deep-Dive Reference</h3>
                <div className="essay-body text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedTopic.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Code Example */}
              {selectedTopic.codeExample ? (
                <div className="code-snippet-section">
                  <div className="code-box-header">
                    <div className="code-filename text-micro">
                      <Terminal className="terminal-icon" />
                      {selectedTopic.codeExample.filename || "spec_example"}
                    </div>
                    
                    <button
                      onClick={() => handleCopy(selectedTopic.codeExample!.code)}
                      className="copy-btn text-micro"
                    >
                      {copied ? (
                        <>
                          <Check className="copy-icon text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="copy-icon" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="code-box-pre-wrapper">
                    <pre className="code-pre text-tiny">
                      <code>{selectedTopic.codeExample.code}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="snippet-placeholder-box">
                  <p className="text-xs text-gray-500 italic">No code snippet required for this reference overview.</p>
                </div>
              )}
            </article>
          ) : (
            <div className="reading-welcome-state animate-fade">
              <BookOpenCheck className="welcome-state-icon" />
              <h2 className="welcome-title">Select a topic to start reading</h2>
              <p className="welcome-desc text-xs">Select a pillar from the leftmost rail, browse subcategories and topics, or search for key terms to load the CTO-level developer guide.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
