import { BodySystem } from "@/types/anatomy";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemSelectorProps {
  activeSystem: BodySystem;
  onSystemChange: (system: BodySystem) => void;
}

const systems: { value: BodySystem; label: string }[] = [
  { value: 'full', label: 'Full body' },
  { value: 'skin', label: 'Skin' },
  { value: 'muscular', label: 'Muscular' },
  { value: 'skeletal', label: 'Skeletal' },
  { value: 'organs', label: 'Organs' },
  { value: 'vascular', label: 'Vascular' },
  { value: 'nervous', label: 'Nervous' },
  { value: 'lymphatic', label: 'Lymphatic' },
];

export const SystemSelector = ({ activeSystem, onSystemChange }: SystemSelectorProps) => {
  return (
    <Tabs value={activeSystem} onValueChange={(value) => onSystemChange(value as BodySystem)}>
      <TabsList className="bg-card border border-border shadow-sm flex-wrap h-auto gap-1 p-2">
        {systems.map((system) => (
          <TabsTrigger
            key={system.value}
            value={system.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-all"
          >
            {system.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
