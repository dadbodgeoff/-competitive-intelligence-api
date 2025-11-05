import { useState, useRef, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onLocationSelect?: (location: string, placeId?: string) => void;
}

// For now, we'll create a simple input that will be enhanced with Google Places later
// This provides the mobile-optimized foundation
export const LocationAutocomplete = forwardRef<HTMLInputElement, LocationAutocompleteProps>(
  ({ className, onLocationSelect, onChange, ...props }, ref) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Mock suggestions for now - will be replaced with Google Places API
    const mockSuggestions = [
      'New York, NY, USA',
      'Los Angeles, CA, USA',
      'Chicago, IL, USA',
      'Houston, TX, USA',
      'Phoenix, AZ, USA',
      'Philadelphia, PA, USA',
      'San Antonio, TX, USA',
      'San Diego, CA, USA',
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      
      // Filter mock suggestions
      if (value.length > 2) {
        const filtered = mockSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }

      // Call parent onChange
      if (onChange) {
        onChange(e);
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      setInputValue(suggestion);
      setShowSuggestions(false);
      
      // Create synthetic event for form integration
      const syntheticEvent = {
        target: { value: suggestion }
      } as React.ChangeEvent<HTMLInputElement>;
      
      if (onChange) {
        onChange(syntheticEvent);
      }
      
      if (onLocationSelect) {
        onLocationSelect(suggestion);
      }
    };

    const handleBlur = () => {
      // Delay hiding suggestions to allow click events
      setTimeout(() => setShowSuggestions(false), 150);
    };

    useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = inputRef.current;
      }
    }, [ref]);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => inputValue.length > 2 && setShowSuggestions(true)}
          className={cn(
            'bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20',
            className
          )}
          autoComplete="off"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-card-dark border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-3 text-left text-white hover:bg-emerald-500/10 focus:bg-emerald-500/10 text-sm border-b border-white/5 last:border-b-0 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ minHeight: '44px' }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

LocationAutocomplete.displayName = 'LocationAutocomplete';