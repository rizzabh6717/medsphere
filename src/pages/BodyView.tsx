import { useState } from "react";
import { SystemSelector } from "@/components/anatomy/SystemSelector";
import { SearchBar } from "@/components/anatomy/SearchBar";
import { AnatomyViewer } from "@/components/anatomy/AnatomyViewer";
import { BodySystem } from "@/types/anatomy";
import NavigationHeader from "@/components/NavigationHeader";

const BodyView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSystem, setActiveSystem] = useState<BodySystem>("full");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-7xl py-8 flex-1">
        {/* Controls */}
        <div className="flex flex-col gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>

          {/* System Selector */}
          <div className="flex justify-center">
            <SystemSelector
              activeSystem={activeSystem}
              onSystemChange={setActiveSystem}
            />
          </div>
        </div>

        {/* Main Viewer */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8 min-h-[600px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AnatomyViewer
            searchQuery={searchQuery}
            activeSystem={activeSystem}
            key={searchTrigger}
          />
        </div>

        {/* Footer Info */}
        <footer className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>Click on system tabs to filter body parts • Type to search • Press Enter or wait to see results • Drag to rotate the model</p>
        </footer>
      </div>

      {/* White Footer Block */}
      <div className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MedSphere. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default BodyView;
