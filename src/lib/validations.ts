import { z } from 'zod';

// Auth validations
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['user', 'modder', 'admin']).optional().default('user'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Product validations
export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  variations: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().positive(),
        stock: z.number().int().nonnegative(),
      })
    )
    .optional(),
  images: z.array(z.string().url('Invalid image URL')),
});

export const updateProductSchema = createProductSchema.partial();

// Service validations
export const createServiceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.number().positive('Base price must be positive'),
  category: z.string().min(1, 'Category is required'),
  modderId: z.string().min(1, 'Modder ID is required'),
  turnaroundTime: z.string().min(1, 'Turnaround time is required'),
  options: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().positive(),
      })
    )
    .optional(),
  images: z.array(z.string().url('Invalid image URL')),
});

export const updateServiceSchema = createServiceSchema.partial();

// Modder validations
export const createModderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  equipment: z.array(z.string()).min(1, 'At least one equipment is required'),
  trustScore: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().nonnegative().default(0),
  status: z.enum(['accepting', 'queue_full', 'on_break']).default('accepting'),
  portfolio: z.array(z.string().url('Invalid portfolio URL')),
  audioSamples: z.array(z.string().url('Invalid audio URL')).optional(),
});

export const updateModderSchema = createModderSchema.partial();

// Helper function to validate request body
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}
