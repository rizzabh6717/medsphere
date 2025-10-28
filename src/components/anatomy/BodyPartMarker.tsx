import { BodyPart } from "@/types/anatomy";
import { useState, useEffect } from "react";

interface BodyPartMarkerProps {
  bodyPart: BodyPart;
  index: number;
  totalParts: number;
}

export const BodyPartMarker = ({ bodyPart, index, totalParts }: BodyPartMarkerProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Stagger the appearance of markers
    const timer = setTimeout(() => setShow(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  if (!show) return null;

  // Determine if marker should be on left or right side based on body part position
  const isLeftSide = bodyPart.position.x < 50;
  
  // Position label at the sides
  const labelX = isLeftSide ? 5 : 95;
  
  // Arrow points from label to body part
  const startX = isLeftSide ? labelX + 5 : labelX - 5;
  const endX = bodyPart.position.x;
  const arrowY = bodyPart.position.y;

  return (
    <>
      {/* Arrow pointing to body part */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Arrowhead marker */}
          <marker
            id={`arrow-${index}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5B68EE" />
          </marker>
        </defs>
        
        {/* Arrow line */}
        <line
          x1={`${startX}%`}
          y1={`${arrowY}%`}
          x2={`${endX}%`}
          y2={`${arrowY}%`}
          stroke="#5B68EE"
          strokeWidth="3"
          markerEnd={`url(#arrow-${index})`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Highlight dot on body part */}
      <div
        className="absolute animate-pulse"
        style={{
          left: `${bodyPart.position.x}%`,
          top: `${bodyPart.position.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 12,
        }}
      >
        <div className="w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-white"></div>
      </div>

      {/* Label at tail of arrow */}
      <div
        className="absolute pointer-events-auto animate-fade-in"
        style={{
          left: `${labelX}%`,
          top: `${arrowY}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
        }}
      >
        <div className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 rounded-xl shadow-2xl p-3 min-w-[200px]">
          <div className="flex items-start gap-3">
            {/* Number badge */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
              {index + 1}
            </div>
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-card-foreground leading-tight mb-1">
                {bodyPart.name}
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                {bodyPart.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
