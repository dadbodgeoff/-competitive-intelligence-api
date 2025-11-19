import { useCallback, useEffect, useRef, useState } from 'react';

export type COGSDemoStatus = 'idle' | 'running' | 'ready';

export type COGSMetric = {
  label: string;
  value: string;
  helper?: string;
};

export type COGSIngredient = {
  id: string;
  name: string;
  unit: string;
  portion: string;
  latestCost: string;
  previousCost?: string;
  variance?: string;
};

export type COGSDemoEventType = 'info' | 'progress' | 'success';

export interface COGSDemoEvent {
  id: string;
  type: COGSDemoEventType;
  message: string;
  timestamp: number;
}

interface COGSDemoState {
  status: COGSDemoStatus;
  events: COGSDemoEvent[];
  metrics?: COGSMetric[];
  ingredients?: COGSIngredient[];
}

const SUMMARY_METRICS: COGSMetric[] = [
  {
    label: 'Menu price',
    value: '$14.00',
  },
  {
    label: 'Total COGS',
    value: '$4.38',
    helper: 'Updated from latest invoice costs',
  },
  {
    label: 'Food cost %',
    value: '31.3%',
    helper: 'Target: 32%',
  },
  {
    label: 'Gross profit',
    value: '$9.62',
  },
];

const DEMO_INGREDIENTS: COGSIngredient[] = [
  {
    id: 'mozzarella',
    name: 'Grande Whole Milk Mozzarella',
    unit: 'lb',
    portion: '0.44 lb (7 oz)',
    latestCost: '$2.86',
    previousCost: '$2.73',
    variance: '+$0.13',
  },
  {
    id: 'dough',
    name: 'House Dough Ball',
    unit: 'ea',
    portion: '1 each',
    latestCost: '$0.74',
  },
  {
    id: 'sauce',
    name: 'San Marzano Sauce Batch',
    unit: 'oz',
    portion: '4 oz',
    latestCost: '$0.42',
  },
  {
    id: 'basil',
    name: 'Fresh Basil Bunch',
    unit: 'g',
    portion: '4 g',
    latestCost: '$0.06',
  },
  {
    id: 'box',
    name: 'Pizza Box 12” Kraft',
    unit: 'ea',
    portion: '1 each',
    latestCost: '$0.30',
  },
];

type DemoStep = {
  delay: number;
  type: COGSDemoEventType;
  message: string;
};

const DEMO_STEPS: DemoStep[] = [
  {
    delay: 400,
    type: 'progress',
    message: 'Linking “Margherita 12”” to the latest Sysco invoice uploads…',
  },
  {
    delay: 1200,
    type: 'progress',
    message: 'Pulling current cost for Grande Whole Milk Mozzarella (7 oz portion)…',
  },
  {
    delay: 2000,
    type: 'info',
    message: 'Box, dough, sauce, and garnish costs refreshed from your mapped inventory items.',
  },
  {
    delay: 2800,
    type: 'progress',
    message: 'Recalculating total COGS, food cost %, and gross profit…',
  },
  {
    delay: 3600,
    type: 'success',
    message: 'Recipe cost updated. Mozzarella variance flagged (+$0.13 vs prior delivery).',
  },
];

const createEventId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const initialState: COGSDemoState = {
  status: 'idle',
  events: [],
};

export function useCogsDemo(autoStart = true) {
  const [state, setState] = useState<COGSDemoState>(initialState);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState(initialState);
  }, [clearTimers]);

  const simulateDemo = useCallback(() => {
    clearTimers();
    setState({
      status: 'running',
      events: [
        {
          id: createEventId(),
          type: 'info',
          message: 'Starting COGS update on Margherita 12” (portion-controlled).',
          timestamp: Date.now(),
        },
      ],
    });

    let cumulativeDelay = 0;

    DEMO_STEPS.forEach((step, index) => {
      cumulativeDelay += step.delay;
      const timeoutId = window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          events: [
            ...prev.events,
            {
              id: createEventId(),
              type: step.type,
              message: step.message,
              timestamp: Date.now(),
            },
          ],
          ...(index === DEMO_STEPS.length - 1
            ? {
                status: 'ready' as COGSDemoStatus,
                metrics: SUMMARY_METRICS,
                ingredients: DEMO_INGREDIENTS,
              }
            : null),
        }));
      }, cumulativeDelay);

      timersRef.current.push(timeoutId);
    });
  }, [clearTimers]);

  useEffect(() => {
    if (autoStart) {
      simulateDemo();
    }

    return () => {
      clearTimers();
    };
  }, [autoStart, clearTimers, simulateDemo]);

  return {
    state,
    simulateDemo,
    reset,
  };
}


