/**
 * Occasion Filter Component for Ethnic Wear
 * Following Single Responsibility Principle - only handles occasion filtering
 * Following Open/Closed Principle - easily extensible for new occasions
 */

import { Occasion } from "@/types/product";
import { FilterSection } from "./FilterSection";
import { FilterCheckbox } from "./FilterCheckbox";

interface OccasionFilterProps {
  selectedOccasions: Occasion[];
  onOccasionChange: (occasions: Occasion[]) => void;
  availableOccasions?: Occasion[];
  className?: string;
}

const DEFAULT_OCCASIONS: Occasion[] = [
  "Wedding",
  "Festival", 
  "Party",
  "Office",
  "Casual",
  "Formal",
  "Traditional",
  "Modern",
];

const OCCASION_EMOJIS: Record<Occasion, string> = {
  Wedding: "💍",
  Festival: "🎉",
  Party: "🥳",
  Office: "💼",
  Casual: "👕",
  Formal: "🤵",
  Traditional: "🕉️",
  Modern: "✨",
};

export const OccasionFilter = ({
  selectedOccasions,
  onOccasionChange,
  availableOccasions = DEFAULT_OCCASIONS,
  className,
}: OccasionFilterProps) => {
  const handleOccasionToggle = (occasion: Occasion, checked: boolean) => {
    if (checked) {
      onOccasionChange([...selectedOccasions, occasion]);
    } else {
      onOccasionChange(selectedOccasions.filter(o => o !== occasion));
    }
  };

  return (
    <FilterSection title="Occasion" className={className}>
      {availableOccasions.map((occasion) => (
        <FilterCheckbox
          key={occasion}
          id={`occasion-${occasion}`}
          label={`${OCCASION_EMOJIS[occasion]} ${occasion}`}
          checked={selectedOccasions.includes(occasion)}
          onChange={(checked) => handleOccasionToggle(occasion, checked)}
        />
      ))}
    </FilterSection>
  );
};
