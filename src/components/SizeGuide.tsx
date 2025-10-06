/**
 * Indian Size Guide Component
 * Following Single Responsibility Principle - only handles size guidance
 * Following Clean Code principles - clear, maintainable implementation
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Shirt, Users } from "lucide-react";

interface SizeGuideProps {
  category: "women" | "men" | "kids";
  className?: string;
}

interface SizeChart {
  size: string;
  chest: string;
  waist: string;
  length?: string;
  hips?: string;
}

const WOMEN_SIZE_CHART: SizeChart[] = [
  { size: "XS", chest: "32-34", waist: "26-28", length: "38", hips: "34-36" },
  { size: "S", chest: "34-36", waist: "28-30", length: "39", hips: "36-38" },
  { size: "M", chest: "36-38", waist: "30-32", length: "40", hips: "38-40" },
  { size: "L", chest: "38-40", waist: "32-34", length: "41", hips: "40-42" },
  { size: "XL", chest: "40-42", waist: "34-36", length: "42", hips: "42-44" },
  { size: "XXL", chest: "42-44", waist: "36-38", length: "43", hips: "44-46" },
];

const MEN_SIZE_CHART: SizeChart[] = [
  { size: "S", chest: "36-38", waist: "30-32", length: "40" },
  { size: "M", chest: "38-40", waist: "32-34", length: "41" },
  { size: "L", chest: "40-42", waist: "34-36", length: "42" },
  { size: "XL", chest: "42-44", waist: "36-38", length: "43" },
  { size: "XXL", chest: "44-46", waist: "38-40", length: "44" },
];

const KIDS_SIZE_CHART: SizeChart[] = [
  { size: "2Y", chest: "20-22", waist: "18-20", length: "26" },
  { size: "4Y", chest: "22-24", waist: "20-22", length: "28" },
  { size: "6Y", chest: "24-26", waist: "22-24", length: "30" },
  { size: "8Y", chest: "26-28", waist: "24-26", length: "32" },
  { size: "10Y", chest: "28-30", waist: "26-28", length: "34" },
  { size: "12Y", chest: "30-32", waist: "28-30", length: "36" },
];

const SizeChartTable = ({ chart }: { chart: SizeChart[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2 font-medium">Size</th>
          <th className="text-left p-2 font-medium">Chest (inches)</th>
          <th className="text-left p-2 font-medium">Waist (inches)</th>
          {chart[0]?.length && <th className="text-left p-2 font-medium">Length (inches)</th>}
          {chart[0]?.hips && <th className="text-left p-2 font-medium">Hips (inches)</th>}
        </tr>
      </thead>
      <tbody>
        {chart.map((row) => (
          <tr key={row.size} className="border-b">
            <td className="p-2 font-medium">{row.size}</td>
            <td className="p-2">{row.chest}</td>
            <td className="p-2">{row.waist}</td>
            {row.length && <td className="p-2">{row.length}</td>}
            {row.hips && <td className="p-2">{row.hips}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SizeGuide = ({ category, className }: SizeGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSizeChart = () => {
    switch (category) {
      case "women":
        return WOMEN_SIZE_CHART;
      case "men":
        return MEN_SIZE_CHART;
      case "kids":
        return KIDS_SIZE_CHART;
      default:
        return WOMEN_SIZE_CHART;
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "women":
        return <Shirt className="h-4 w-4" />;
      case "men":
        return <Users className="h-4 w-4" />;
      case "kids":
        return <Users className="h-4 w-4" />;
      default:
        return <Ruler className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          {getCategoryIcon()}
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Size Guide - {category.charAt(0).toUpperCase() + category.slice(1)}'s Wear
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Size Chart</TabsTrigger>
            <TabsTrigger value="guide">How to Measure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this chart to find your perfect fit. All measurements are in inches.
              </p>
              <SizeChartTable chart={getSizeChart()} />
            </div>
          </TabsContent>
          
          <TabsContent value="guide" className="mt-4">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Chest Measurement</h4>
                  <p className="text-sm text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape measure horizontal.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Waist Measurement</h4>
                  <p className="text-sm text-muted-foreground">
                    Measure around your natural waistline, usually the narrowest part of your torso.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Length Measurement</h4>
                  <p className="text-sm text-muted-foreground">
                    For kurtas and tops, measure from the shoulder to the desired length.
                  </p>
                </div>
                {category === "women" && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Hip Measurement</h4>
                    <p className="text-sm text-muted-foreground">
                      Measure around the fullest part of your hips, about 7-9 inches below your waist.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Always measure over thin clothing or bare skin</li>
                  <li>• Keep the measuring tape snug but not tight</li>
                  <li>• For sarees, consider your blouse size separately</li>
                  <li>• When in doubt, size up for comfort</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
