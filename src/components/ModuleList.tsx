import React from "react";
import { Bookmark, FileText, ChevronRight } from "lucide-react";
import type { Module, Topic } from "../data/curriculum";

interface ModuleListProps {
  modules: Module[];
  bookmarkedTopicIds: string[];
  onToggleBookmark: (topicId: string, e: React.MouseEvent) => void;
  onSelectTopic: (topic: Topic) => void;
  selectedTopicId?: string;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  bookmarkedTopicIds,
  onToggleBookmark,
  onSelectTopic,
  selectedTopicId,
}) => {
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-gray-800 rounded-2xl bg-gray-950/20">
        <p className="text-gray-400 text-sm">No topics matching current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {modules.map((module) => (
        <section key={module.id} className="animate-fade">
          {/* Module Header */}
          <div className="border-b border-gray-900 pb-3 mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              {module.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{module.description}</p>
          </div>

          {/* Module Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {module.topics.map((topic) => {
              const isBookmarked = bookmarkedTopicIds.includes(topic.id);
              const isSelected = topic.id === selectedTopicId;

              return (
                <div
                  key={topic.id}
                  onClick={() => onSelectTopic(topic)}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "bg-cyan-950/15 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
                      : "bg-gray-900/20 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900/40"
                  }`}
                >
                  <div>
                    {/* Top Action Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400 transition-colors"}`} />
                        <span className="text-micro font-mono text-cyan-500 tracking-wider uppercase">Reference Topic</span>
                      </div>
                      
                      {/* Bookmark Toggle */}
                      <button
                        onClick={(e) => onToggleBookmark(topic.id, e)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isBookmarked
                            ? "bg-cyan-950/60 border-cyan-800 text-cyan-400"
                            : "bg-gray-900/60 border-gray-800 text-gray-500 hover:text-white hover:border-gray-700"
                        }`}
                        title="Bookmark topic"
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-cyan-400" : ""}`} />
                      </button>
                    </div>

                    {/* Topic content */}
                    <h3 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {topic.title}
                    </h3>
                    
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {topic.shortDesc}
                    </p>
                  </div>

                  {/* Footer metadata & tags */}
                  <div className="mt-4 pt-3 border-t border-gray-900/60 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-gray-900/80 text-micro font-medium text-gray-400 border border-gray-800/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-0.5 text-xs text-cyan-500 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                      Read
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
