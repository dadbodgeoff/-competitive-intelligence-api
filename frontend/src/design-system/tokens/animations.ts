/**
 * Design System - Animation Tokens
 * Restaurant Competitive Intelligence Platform
 */

export const durations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

export const easings = {
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const animations = {
  fadeIn: {
    name: 'fadeIn',
    duration: '0.6s',
    easing: 'ease-out',
  },
  fadeOut: {
    name: 'fadeOut',
    duration: '0.3s',
    easing: 'ease-out',
  },
  slideUp: {
    name: 'slideUp',
    duration: '0.6s',
    easing: 'ease-out',
  },
  slideDown: {
    name: 'slideDown',
    duration: '0.6s',
    easing: 'ease-out',
  },
  slideInRight: {
    name: 'slideInRight',
    duration: '0.6s',
    easing: 'ease-out',
  },
  slideInLeft: {
    name: 'slideInLeft',
    duration: '0.6s',
    easing: 'ease-out',
  },
  scaleIn: {
    name: 'scaleIn',
    duration: '0.3s',
    easing: 'ease-out',
  },
  spin: {
    name: 'spin',
    duration: '1s',
    easing: 'linear',
    iteration: 'infinite',
  },
  pulse: {
    name: 'pulse',
    duration: '2s',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iteration: 'infinite',
  },
  bounce: {
    name: 'bounce',
    duration: '1s',
    easing: 'ease-in-out',
    iteration: 'infinite',
  },
  shimmer: {
    name: 'shimmer',
    duration: '1.5s',
    easing: 'linear',
    iteration: 'infinite',
  },
} as const;

export const transitions = {
  all: `all ${durations.normal} ${easings.inOut}`,
  colors: `background-color ${durations.normal}, border-color ${durations.normal}, color ${durations.normal}`,
  transform: `transform ${durations.normal} ${easings.inOut}`,
  opacity: `opacity ${durations.normal} ease-in-out`,
} as const;

// Helper function to create animation string
export function getAnimation(
  name: keyof typeof animations,
  options?: { duration?: string; easing?: string; iteration?: string }
): string {
  const anim = animations[name];
  const duration = options?.duration || anim.duration;
  const easing = options?.easing || anim.easing;
  const iteration = options?.iteration || '';
  
  return `${anim.name} ${duration} ${easing} ${iteration}`.trim();
}

// Helper function to get transition
export function getTransition(type: keyof typeof transitions): string {
  return transitions[type];
}
