/**
 * Price Range Filter Component
 * Following Single Responsibility Principle - only handles price filtering
 * Following Clean Code principles - clear, readable implementation
 */

import { Slider } from "@/components/ui/slider";
import { FilterSection } from "./FilterSection";

interface PriceRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
}

export const PriceRangeFilter = ({
  value,
  onChange,
  min = 0,
  max = 20000,
  step = 500,
  currency = "₹",
}: PriceRangeFilterProps) => {
  return (
    <FilterSection title="Price Range">
      <div className="space-y-4">
        <Slider
          value={value}
          onValueChange={onChange}
          max={max}
          min={min}
          step={step}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currency}{value[0].toLocaleString()}</span>
          <span>{currency}{value[1].toLocaleString()}</span>
        </div>
      </div>
    </FilterSection>
  );
};
