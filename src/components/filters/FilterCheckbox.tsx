/**
 * Reusable Filter Checkbox Component
 * Following Single Responsibility Principle - only handles checkbox filtering
 * Following DRY Principle - reusable across all filter types
 */

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  disabled?: boolean;
  className?: string;
}

export const FilterCheckbox = ({
  id,
  label,
  checked,
  onChange,
  count,
  disabled = false,
  className,
}: FilterCheckboxProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="peer"
      />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
      >
        {label}
        {count !== undefined && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({count})
          </span>
        )}
      </label>
    </div>
  );
};
