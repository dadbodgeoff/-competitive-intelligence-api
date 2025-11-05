import { z } from "zod"

/**
 * Common validation schemas for forms
 */

export const emailSchema = z.string().email("Invalid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")

export const urlSchema = z.string().url("Invalid URL")

export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`)

export const optionalString = z.string().optional()

export const numberSchema = (min?: number, max?: number) => {
  let schema = z.number()
  if (min !== undefined) schema = schema.min(min, `Must be at least ${min}`)
  if (max !== undefined) schema = schema.max(max, `Must be at most ${max}`)
  return schema
}

/**
 * Restaurant-specific schemas
 */

export const restaurantNameSchema = z
  .string()
  .min(2, "Restaurant name must be at least 2 characters")
  .max(100, "Restaurant name must be less than 100 characters")

export const locationSchema = z
  .string()
  .min(2, "Location is required")

export const radiusSchema = z.enum(["1", "3", "5", "10"], {
  errorMap: () => ({ message: "Please select a valid radius" }),
})

/**
 * Competitor search form schema
 */
export const competitorSearchSchema = z.object({
  restaurantName: restaurantNameSchema,
  location: locationSchema,
  radius: radiusSchema,
})

export type CompetitorSearchFormData = z.infer<typeof competitorSearchSchema>
