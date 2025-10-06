/**
 * Reusable Filter Section Component
 * Following Single Responsibility Principle - only handles section layout
 * Following DRY Principle - reusable for all filter types
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export const FilterSection = ({
  title,
  children,
  className,
  maxHeight = "max-h-[300px]",
}: FilterSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <div className={cn("space-y-3 overflow-y-auto pr-2", maxHeight)}>
        {children}
      </div>
    </div>
  );
};
