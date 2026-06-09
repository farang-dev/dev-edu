import React from "react";
import { Sparkles, Search, Bookmark } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedBookmarksCount: number;
  showSavedOnly: boolean;
  setShowSavedOnly: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  savedBookmarksCount,
  showSavedOnly,
  setShowSavedOnly,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#030712]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#030712]">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 opacity-30 blur-sm"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Dev-Edu <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">No-BS Catalog</span>
            </h1>
            <p className="text-micro text-gray-500 font-mono">systematic developer reference</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative hidden sm:block w-72">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search concepts, engines, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-900/50 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Bookmarks Toggle button */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-2 px-4 h-10 rounded-xl border text-sm transition-all ${
              showSavedOnly
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "bg-gray-900/30 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <Bookmark className={`h-4.5 w-4.5 ${showSavedOnly ? "fill-cyan-400 text-cyan-400" : ""}`} />
            <span>Bookmarks</span>
            {savedBookmarksCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyan-500 px-1.5 text-tiny font-bold text-black">
                {savedBookmarksCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Search bar */}
      <div className="block sm:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search concepts, engines, specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-900/50 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>
    </header>
  );
};
