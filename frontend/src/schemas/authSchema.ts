import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must contain at least 2 characters')
    .max(120, 'Full name cannot exceed 120 characters'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .regex(
      /[a-z]/,
      'Password must contain a lowercase letter'
    )
    .regex(
      /[A-Z]/,
      'Password must contain an uppercase letter'
    )
    .regex(
      /[0-9]/,
      'Password must contain a number'
    ),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must contain at least 8 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues =
  z.infer<typeof loginSchema>;

export type RegisterFormValues =
  z.infer<typeof registerSchema>;

export type ForgotPasswordFormValues =
  z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormValues =
  z.infer<typeof resetPasswordSchema>;
