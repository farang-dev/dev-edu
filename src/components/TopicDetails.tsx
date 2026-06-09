import React, { useState } from "react";
import { X, Bookmark, Copy, Check, Terminal, FileText, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Topic } from "../data/curriculum";

interface TopicDetailsProps {
  topic: Topic;
  isBookmarked: boolean;
  onToggleBookmark: (topicId: string) => void;
  onClose: () => void;
}

export const TopicDetails: React.FC<TopicDetailsProps> = ({
  topic,
  isBookmarked,
  onToggleBookmark,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (topic.codeExample) {
      navigator.clipboard.writeText(topic.codeExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border-l border-gray-900 overflow-hidden shadow-2xl animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-900 bg-[#090d16]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-micro font-mono text-cyan-500 uppercase tracking-widest">Reading Reference</span>
            <h2 className="text-base font-bold text-white tracking-tight line-clamp-1">{topic.title}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(topic.id)}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked
                ? "bg-cyan-950/60 border-cyan-800 text-cyan-400"
                : "bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-cyan-400" : ""}`} />
          </button>
          
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-gray-800 bg-gray-900/60 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Short description */}
        <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-cyan-500 pl-4 py-1">
          "{topic.shortDesc}"
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-lg bg-gray-900/80 text-xs font-medium text-gray-400 border border-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Key points summary card */}
        <div className="p-5 rounded-2xl bg-gray-900/20 border border-gray-800/60 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            Key Concepts & Spec Notes
          </h3>
          <ul className="space-y-2.5">
            {topic.keyPoints.map((point, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Deep Dive Expository Text */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Deep-Dive Explanation</h3>
          <div className="text-xs text-gray-300 leading-relaxed prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {topic.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Code Snippet / Repository Structure */}
        {topic.codeExample && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-gray-400" />
                {topic.codeExample.filename || "Example Spec Code"}
              </h3>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-tiny font-medium text-gray-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-2xl border border-gray-800/80 bg-[#06080e] overflow-hidden">
              <pre className="p-5 overflow-x-auto text-tiny leading-relaxed text-gray-300 font-mono">
                <code>{topic.codeExample.code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
