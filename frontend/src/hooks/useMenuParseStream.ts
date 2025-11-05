import { useState, useEffect, useRef, useCallback } from 'react';

// Transform flat menu_items array into nested categories structure
function transformMenuData(rawData: any): MenuData {
  const menuItems = rawData.menu_items || [];
  const categoryMap = new Map<string, MenuItem[]>();
  
  // Group items by category
  menuItems.forEach((item: any) => {
    const categoryName = item.category || 'Uncategorized';
    const menuItem: MenuItem = {
      name: item.item_name || item.name || '',
      description: item.description || undefined,
      prices: item.prices || [],  // Keep all prices
      category: categoryName,
      dietary_tags: item.dietary_tags || undefined,
      available: item.available !== false,
    };
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    categoryMap.get(categoryName)!.push(menuItem);
  });
  
  // Convert map to categories array
  const categories: MenuCategory[] = Array.from(categoryMap.entries()).map(([name, items]) => ({
    name,
    items,
  }));
  
  return {
    restaurant_name: rawData.restaurant_name || 'Unknown Restaurant',
    menu_type: rawData.menu_type || undefined,
    categories,
    menu_items: menuItems, // Keep original for reference
  };
}

interface MenuItemPrice {
  size: string | null;
  price: number;
}

interface MenuItem {
  name: string;
  description?: string;
  prices: MenuItemPrice[];  // Changed from single price to array
  category?: string;
  dietary_tags?: string[];
  available?: boolean;
}

interface MenuCategory {
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuData {
  restaurant_name: string;
  menu_type?: string;
  categories: MenuCategory[];
  menu_items: MenuItem[];
}

interface ParseMetadata {
  model_used: string;
  parse_time_seconds: number;
  cost: number;
  tokens_used: number;
  confidence: 'high' | 'medium' | 'low';
  corrections_made: number;
}

interface ParseState {
  status: 'idle' | 'uploading' | 'parsing' | 'validating' | 'ready' | 'saving' | 'saved' | 'error';
  menuData?: MenuData;
  parseMetadata?: ParseMetadata;
  progress: number;
  currentStep: string;
  error?: string;
  fileUrl?: string;
  elapsedSeconds: number;
}

interface UseMenuParseStreamReturn {
  state: ParseState;
  startParsing: (fileUrl: string, restaurantHint?: string) => void;
  stopParsing: () => void;
  updateMenuItem: (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: any) => void;
  addMenuItem: (categoryIndex: number) => void;
  deleteMenuItem: (categoryIndex: number, itemIndex: number) => void;
  updateCategory: (categoryIndex: number, field: keyof MenuCategory, value: any) => void;
  addCategory: () => void;
  deleteCategory: (categoryIndex: number) => void;
  updateMenuHeader: (field: keyof MenuData, value: any) => void;
  saveToDatabase: () => Promise<string>;
  isConnected: boolean;
}

export function useMenuParseStream(): UseMenuParseStreamReturn {
  const [state, setState] = useState<ParseState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    elapsedSeconds: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopParsing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const startParsing = useCallback((fileUrl: string, restaurantHint?: string) => {
    stopParsing();

    setState(prev => ({
      ...prev,
      status: 'parsing',
      progress: 0,
      currentStep: 'Connecting...',
      menuData: undefined,
      parseMetadata: undefined,
      error: undefined,
      fileUrl,
      elapsedSeconds: 0,
    }));

    abortControllerRef.current = new AbortController();

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams({
        file_url: fileUrl,
        ...(restaurantHint && { restaurant_name_hint: restaurantHint }),
      });
      const streamUrl = `${baseUrl}/api/v1/menu/parse-stream?${params}`;

      const startStreamingRequest = async () => {
        try {
          const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
            },
            credentials: 'include', // Send cookies
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          if (!response.body) {
            throw new Error('No response body for streaming');
          }

          setIsConnected(true);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let currentEventType = '';

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('event:')) {
                currentEventType = line.substring(6).trim();
                continue;
              }

              if (line.startsWith('data:')) {
                try {
                  const data = JSON.parse(line.substring(5).trim());
                  handleStreamEvent(currentEventType || 'message', data);
                } catch (e) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }
          }

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Parsing request aborted');
            return;
          }
          
          console.error('Streaming request failed:', error);
          setState(prev => ({
            ...prev,
            status: 'error',
            error: error instanceof Error ? error.message : 'Parsing failed',
          }));
        } finally {
          setIsConnected(false);
        }
      };

      const handleStreamEvent = (eventType: string, data: any) => {
        switch (eventType) {
          case 'parsing_started':
            setState(prev => ({
              ...prev,
              currentStep: data.message || 'Processing your menu...',
              progress: 5,
            }));
            break;

          case 'parsing_progress':
            setState(prev => ({
              ...prev,
              currentStep: data.message || 'Still processing...',
              progress: Math.min(prev.progress + 10, 90),
              elapsedSeconds: data.elapsed_seconds || prev.elapsedSeconds,
            }));
            break;

          case 'parsed_data':
            // Transform flat menu_items into nested categories structure
            const transformedMenuData = transformMenuData(data.menu_data);
            setState(prev => ({
              ...prev,
              status: 'validating',
              menuData: transformedMenuData,
              parseMetadata: data.metadata,
              currentStep: 'Validating data...',
              progress: 95,
            }));
            break;

          case 'validation_complete':
            setState(prev => ({
              ...prev,
              status: 'ready',
              currentStep: 'Menu ready for review',
              progress: 100,
              parseMetadata: prev.parseMetadata ? {
                ...prev.parseMetadata,
                confidence: data.validation?.confidence || 'medium',
                corrections_made: data.validation?.corrections_made || 0,
              } : undefined,
            }));
            stopParsing();
            break;

          case 'error':
            setState(prev => ({
              ...prev,
              status: 'error',
              error: data.message || 'Parsing failed',
            }));
            stopParsing();
            break;

          default:
            console.log('Unknown event type:', eventType, data);
        }
      };

      startStreamingRequest();

    } catch (error) {
      console.error('Failed to start parsing:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start parsing',
      }));
    }
  }, [stopParsing]);

  const updateMenuItem = useCallback((categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: any) => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      const newCategories = [...prev.menuData.categories];
      const newItems = [...newCategories[categoryIndex].items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], items: newItems };
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          categories: newCategories,
        },
      };
    });
  }, []);

  const addMenuItem = useCallback((categoryIndex: number) => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      const newItem: MenuItem = {
        name: '',
        prices: [{ size: null, price: 0 }],
        available: true,
      };
      
      const newCategories = [...prev.menuData.categories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: [...newCategories[categoryIndex].items, newItem],
      };
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          categories: newCategories,
        },
      };
    });
  }, []);

  const deleteMenuItem = useCallback((categoryIndex: number, itemIndex: number) => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      const newCategories = [...prev.menuData.categories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex),
      };
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          categories: newCategories,
        },
      };
    });
  }, []);

  const updateCategory = useCallback((categoryIndex: number, field: keyof MenuCategory, value: any) => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      const newCategories = [...prev.menuData.categories];
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], [field]: value };
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          categories: newCategories,
        },
      };
    });
  }, []);

  const addCategory = useCallback(() => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      const newCategory: MenuCategory = {
        name: 'New Category',
        items: [],
      };
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          categories: [...prev.menuData.categories, newCategory],
        },
      };
    });
  }, []);

  const deleteCategory = useCallback((categoryIndex: number) => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          categories: prev.menuData.categories.filter((_, i) => i !== categoryIndex),
        },
      };
    });
  }, []);

  const updateMenuHeader = useCallback((field: keyof MenuData, value: any) => {
    setState(prev => {
      if (!prev.menuData) return prev;
      
      return {
        ...prev,
        menuData: {
          ...prev.menuData,
          [field]: value,
        },
      };
    });
  }, []);

  const saveToDatabase = useCallback(async (): Promise<string> => {
    if (!state.menuData || !state.parseMetadata || !state.fileUrl) {
      throw new Error('No menu data to save');
    }

    setState(prev => ({ ...prev, status: 'saving' }));

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/menu/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({
          menu_data: state.menuData,
          parse_metadata: state.parseMetadata,
          file_url: state.fileUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save menu');
      }

      const result = await response.json();
      
      setState(prev => ({ ...prev, status: 'saved' }));
      
      return result.menu_id;

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to save menu',
      }));
      throw error;
    }
  }, [state.menuData, state.parseMetadata, state.fileUrl]);

  useEffect(() => {
    return () => {
      stopParsing();
    };
  }, [stopParsing]);

  return {
    state,
    startParsing,
    stopParsing,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    updateCategory,
    addCategory,
    deleteCategory,
    updateMenuHeader,
    saveToDatabase,
    isConnected,
  };
}
