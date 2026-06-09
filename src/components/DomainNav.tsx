import React from "react";
import * as Icons from "lucide-react";
import type { Domain } from "../data/curriculum";

interface DomainNavProps {
  domains: Domain[];
  selectedDomainId: string;
  onSelectDomain: (id: string) => void;
}

export const DomainNav: React.FC<DomainNavProps> = ({
  domains,
  selectedDomainId,
  onSelectDomain,
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {domains.map((domain) => {
          // Dynmically select matching icon or default to BookOpen
          const IconComponent = (Icons as any)[domain.iconName] || Icons.BookOpen;

          const isSelected = domain.id === selectedDomainId;

          return (
            <button
              key={domain.id}
              onClick={() => onSelectDomain(domain.id)}
              className={`relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-gray-900/60 border-cyan-500 shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]"
                  : "bg-gray-950/40 border-gray-800 hover:border-gray-700 hover:bg-gray-900/20"
              }`}
            >
              {/* Highlight bar */}
              {isSelected && (
                <span className="absolute inset-x-0 -top-[1px] h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500 rounded-t-full" />
              )}

              <div
                className={`p-2.5 rounded-xl mb-4 transition-all ${
                  isSelected
                    ? "bg-cyan-950/80 text-cyan-400"
                    : "bg-gray-900/60 text-gray-400 group-hover:text-white"
                }`}
              >
                <IconComponent className="h-5 w-5" />
              </div>

              <h3
                className={`text-base font-bold transition-colors ${
                  isSelected ? "text-white" : "text-gray-300"
                }`}
              >
                {domain.title}
              </h3>

              <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {domain.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
