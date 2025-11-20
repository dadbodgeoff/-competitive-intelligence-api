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
    const [suggestions, setSuggestions] = useState<Array<{ label: string; placeId?: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchSuggestions = async (value: string) => {
      if (value.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`,
          {
            headers: {
              'Accept-Language': 'en',
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
        }

        const data: Array<{ display_name: string; place_id: string }> = await response.json();
        setSuggestions(
          data.map((item) => ({
            label: item.display_name,
            placeId: item.place_id,
          }))
        );
        setShowSuggestions(data.length > 0);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      fetchSuggestions(value);

      if (onChange) {
        onChange(event);
      }
    };

    const handleSuggestionClick = (suggestion: { label: string; placeId?: string }) => {
      setInputValue(suggestion.label);
      setShowSuggestions(false);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create synthetic event for form integration
      const syntheticEvent = {
        target: { value: suggestion.label },
      } as React.ChangeEvent<HTMLInputElement>;

      if (onChange) {
        onChange(syntheticEvent);
      }

      if (onLocationSelect) {
        onLocationSelect(suggestion.label, suggestion.placeId);
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

    useEffect(() => {
      return () => {
        abortControllerRef.current?.abort();
      };
    }, []);

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
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

LocationAutocomplete.displayName = 'LocationAutocomplete';