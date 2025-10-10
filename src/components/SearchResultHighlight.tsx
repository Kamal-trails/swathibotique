import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchResult } from '@/services/searchService';

interface SearchResultHighlightProps {
  result: SearchResult;
  query: string;
}

export const SearchResultHighlight: React.FC<SearchResultHighlightProps> = ({ result, query }) => {
  const { product, matchedFields, highlights } = result;
  const searchTerms = query.toLowerCase().split(/\s+/);

  // Highlight matching text in a string
  const highlightText = (text: string, terms: string[]): React.ReactNode => {
    if (!terms.length) return text;

    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '**$1**');
    });

    const parts = highlightedText.split('**');
    return parts.map((part, index) => {
      const isHighlighted = index % 2 === 1;
      return isHighlighted ? (
        <mark key={index} className="bg-accent/20 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  return (
    <div className="space-y-2">
      {/* Matched Fields Badges */}
      {matchedFields.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {matchedFields.map(field => (
            <Badge 
              key={field} 
              variant="secondary" 
              className="text-xs"
            >
              {field}
            </Badge>
          ))}
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="space-y-1">
          {highlights.slice(0, 2).map((highlight, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              {highlightText(highlight, searchTerms)}
            </div>
          ))}
        </div>
      )}

      {/* Search Score Indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <span>Relevance Score: {result.score.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
