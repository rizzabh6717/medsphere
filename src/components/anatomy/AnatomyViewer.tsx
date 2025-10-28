import { useState, useMemo } from "react";
import { BodySystem, bodyParts, BodyPart } from "@/types/anatomy";
import { BodyPartMarker } from "./BodyPartMarker";
import { toast } from "sonner";

interface AnatomyViewerProps {
  searchQuery: string;
  activeSystem: BodySystem;
}

export const AnatomyViewer = ({ searchQuery, activeSystem }: AnatomyViewerProps) => {
  const [selectedParts, setSelectedParts] = useState<BodyPart[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Filter body parts based on search query and active system
  const filteredParts = useMemo(() => {
    const parts = bodyParts.filter(part => 
      part.system.includes(activeSystem)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matches = parts.filter(part => 
        part.name.toLowerCase().includes(query) ||
        part.aliases.some(alias => alias.toLowerCase().includes(query))
      );

      if (matches.length > 0) {
        setSelectedParts(matches);
        if (matches.length === 1) {
          toast.success(`Found: ${matches[0].name}`, {
            description: matches[0].description,
          });
        } else {
          toast.success(`Found ${matches.length} matches`);
        }
        return matches;
      } else {
        setSelectedParts([]);
        toast.error("No body part found", {
          description: "Try searching for: heart, brain, biceps, etc.",
        });
        return [];
      }
    }

    return [];
  }, [searchQuery, activeSystem]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      setRotation(prev => prev + deltaX * 0.5);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-background rounded-2xl overflow-hidden">
      {/* Body Image Container with 3D rotation */}
      <div 
        className="relative w-full max-w-2xl mx-auto perspective-container cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative transition-transform duration-100"
          style={{ 
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <img
            src="/assets/body-muscular.png"
            alt="Human Body Anatomy"
            className="w-full h-auto object-contain drop-shadow-2xl select-none"
            draggable={false}
          />

          {/* Markers for selected body parts */}
          {filteredParts.map((part, index) => (
            <BodyPartMarker key={part.id} bodyPart={part} index={index} totalParts={filteredParts.length} />
          ))}
        </div>
      </div>

      {/* Help text when no search */}
      {!searchQuery.trim() && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Type a body part name to locate it • Click and drag to rotate
          </p>
        </div>
      )}
    </div>
  );
};
