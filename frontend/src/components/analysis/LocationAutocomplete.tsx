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
            "form-input", // Mobile-optimized class
            className
          )}
          autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm border-b border-border last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ minHeight: '44px' }} // Mobile touch target
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