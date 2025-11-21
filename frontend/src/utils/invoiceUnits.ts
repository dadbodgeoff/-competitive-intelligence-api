type PackPatternType = 'multiply' | 'can_size' | 'count' | 'simple';

interface ParsedPackSize {
  type: PackPatternType;
  count: number;
  size: number;
  unit: string;
}

interface BaseQuantity {
  quantity: number;
  unit: string;
}

export interface PackConversionResult {
  hasConversion: boolean;
  error?: string;
  normalizedPackSize?: string;
  parsed?: ParsedPackSize;
  perPackBase?: BaseQuantity;
  totalBase?: BaseQuantity;
  perPackDisplay?: BaseQuantity;
  totalDisplay?: BaseQuantity;
}

const WEIGHT_TO_OUNCES: Record<string, number> = {
  oz: 1,
  ounce: 1,
  ounces: 1,
  lb: 16,
  lbs: 16,
  pound: 16,
  pounds: 16,
  '#': 16,
  g: 0.035274,
  gram: 0.035274,
  grams: 0.035274,
  kg: 35.274,
  kilogram: 35.274,
  kilograms: 35.274,
};

const VOLUME_TO_FLOZ: Record<string, number> = {
  'fl oz': 1,
  floz: 1,
  'fluid ounce': 1,
  'fluid ounces': 1,
  cup: 8,
  cups: 8,
  pt: 16,
  pint: 16,
  pints: 16,
  qt: 32,
  quart: 32,
  quarts: 32,
  gal: 128,
  ga: 128,
  gallon: 128,
  gallons: 128,
  ml: 0.033814,
  milliliter: 0.033814,
  milliliters: 0.033814,
  l: 33.814,
  lt: 33.814,
  liter: 33.814,
  liters: 33.814,
  tbsp: 0.5,
  tablespoon: 0.5,
  tablespoons: 0.5,
  tsp: 0.166667,
  teaspoon: 0.166667,
  teaspoons: 0.166667,
};

const COUNT_TO_EACH: Record<string, number> = {
  ea: 1,
  each: 1,
  pc: 1,
  pcs: 1,
  piece: 1,
  pieces: 1,
  ct: 1,
  count: 1,
  dz: 12,
  dozen: 12,
  gross: 144,
  cs: 1,
  case: 1,
  box: 1,
  pack: 1,
  pkg: 1,
  package: 1,
};

const PACK_PATTERNS: Array<[RegExp, PackPatternType]> = [
  [/(\d+)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)/i, 'multiply'],
  [/(\d+)\s*\/\s*(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)/i, 'multiply'],
  [/(\d+)\s{2,}(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)/i, 'multiply'],
  [/(\d+)\s+(\d+(?:\.\d+)?)\s+(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)(?:\s|$)/i, 'multiply'],
  [/(\d+)\s*#(\d+)/i, 'can_size'],
  [/(\d+)\s*(ct|count|dz|dozen|cs|case|box|pack|pkg)/i, 'count'],
  [/(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup|ea|each|pc|pcs)/i, 'simple'],
];

function normalizeUnit(rawUnit: string): string {
  const unit = rawUnit.trim().toLowerCase();
  if (unit === '#') return 'lb';
  if (unit === 'floz') return 'fl oz';
  if (unit === 'ga') return 'gal';
  return unit;
}

function parsePackSize(packSize?: string | null): ParsedPackSize | null {
  if (!packSize) return null;
  const normalized = packSize.trim();
  if (!normalized) return null;

  for (const [pattern, type] of PACK_PATTERNS) {
    const match = normalized.match(pattern);
    if (!match) continue;

    if (type === 'multiply') {
      return {
        type,
        count: Number(match[1]),
        size: Number(match[2]),
        unit: normalizeUnit(match[3]),
      };
    }

    if (type === 'can_size') {
      const canSizes: Record<string, number> = {
        '10': 96,
        '5': 56,
        '2': 20,
      };
      const count = Number(match[1]);
      const canNumber = match[2];
      const size = canSizes[canNumber] ?? 96;
      return {
        type,
        count,
        size,
        unit: 'oz',
      };
    }

    if (type === 'count') {
      return {
        type,
        count: Number(match[1]),
        size: 1,
        unit: 'ea',
      };
    }

    if (type === 'simple') {
      return {
        type,
        count: 1,
        size: Number(match[1]),
        unit: normalizeUnit(match[2]),
      };
    }
  }

  return null;
}

function convertToBase(quantity: number, unit: string): BaseQuantity {
  if (Number.isNaN(quantity)) {
    return { quantity: 0, unit };
  }

  if (WEIGHT_TO_OUNCES[unit] != null) {
    return { quantity: quantity * WEIGHT_TO_OUNCES[unit], unit: 'oz' };
  }

  if (VOLUME_TO_FLOZ[unit] != null) {
    return { quantity: quantity * VOLUME_TO_FLOZ[unit], unit: 'fl oz' };
  }

  if (COUNT_TO_EACH[unit] != null) {
    return { quantity: quantity * COUNT_TO_EACH[unit], unit: 'ea' };
  }

  return { quantity, unit };
}

function toFriendly(quantity: number, unit: string): BaseQuantity {
  if (unit === 'oz') {
    if (quantity >= 16) {
      return { quantity: quantity / 16, unit: 'lb' };
    }
    return { quantity, unit: 'oz' };
  }

  if (unit === 'fl oz') {
    if (quantity >= 128) {
      return { quantity: quantity / 128, unit: 'gal' };
    }
    if (quantity >= 32) {
      return { quantity: quantity / 32, unit: 'qt' };
    }
    return { quantity, unit: 'fl oz' };
  }

  if (unit === 'ea') {
    return { quantity, unit: 'ea' };
  }

  return { quantity, unit };
}

function safeNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return num;
}

function normalizePackSizeDisplay(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function computePackConversion(
  packSize?: string | null,
  rawQuantity?: number | null
): PackConversionResult {
  const quantity = safeNumber(rawQuantity);
  if (!packSize || quantity == null || quantity <= 0) {
    return { hasConversion: false };
  }

  const parsed = parsePackSize(packSize);
  if (!parsed) {
    return {
      hasConversion: false,
      error: 'unparsed_pack_size',
    };
  }

  const normalizedPackSize = normalizePackSizeDisplay(packSize);

  const perPackOriginal =
    parsed.type === 'count'
      ? parsed.count
      : parsed.type === 'multiply' || parsed.type === 'can_size'
      ? parsed.count * parsed.size
      : parsed.size;

  const totalOriginal =
    parsed.type === 'count'
      ? parsed.count * quantity
      : parsed.type === 'multiply' || parsed.type === 'can_size'
      ? parsed.count * parsed.size * quantity
      : parsed.size * quantity;

  const perPackBase = convertToBase(perPackOriginal, parsed.unit);
  const totalBase = convertToBase(totalOriginal, parsed.unit);

  const perPackDisplay = toFriendly(perPackBase.quantity, perPackBase.unit);
  const totalDisplay = toFriendly(totalBase.quantity, totalBase.unit);

  return {
    hasConversion: true,
    normalizedPackSize,
    parsed,
    perPackBase,
    totalBase,
    perPackDisplay,
    totalDisplay,
  };
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatQuantity(value?: number | null, unit?: string | null): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  if (!unit) {
    return value.toFixed(value >= 100 ? 0 : 2);
  }

  const absValue = Math.abs(value);
  const precision = absValue >= 100 ? 0 : absValue >= 10 ? 1 : 2;
  const rounded = clampValue(Number(value.toFixed(precision)), -1_000_000, 1_000_000);
  return `${rounded.toFixed(precision)} ${unit}`.trim();
}

export function attachConversionToLineItem<T extends { pack_size?: string; quantity?: number }>(
  item: T
): T & {
  conversion?: PackConversionResult;
  converted_quantity?: number;
  converted_unit?: string;
  per_pack_quantity?: number;
  per_pack_unit?: string;
} {
  const conversion = computePackConversion(item.pack_size, item.quantity);
  if (!conversion.hasConversion || !conversion.totalDisplay || !conversion.perPackDisplay) {
    return {
      ...item,
      conversion,
    };
  }

  return {
    ...item,
    conversion,
    converted_quantity: conversion.totalDisplay.quantity,
    converted_unit: conversion.totalDisplay.unit,
    per_pack_quantity: conversion.perPackDisplay.quantity,
    per_pack_unit: conversion.perPackDisplay.unit,
  };
}

