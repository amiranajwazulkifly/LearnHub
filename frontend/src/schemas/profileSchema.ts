import { z } from 'zod';

export const profileSchema = z.object({
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
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(8, 'New password must contain at least 8 characters')
      .regex(
        /[a-z]/,
        'New password must contain a lowercase letter'
      )
      .regex(
        /[A-Z]/,
        'New password must contain an uppercase letter'
      )
      .regex(
        /[0-9]/,
        'New password must contain a number'
      ),

    confirmPassword: z
      .string()
      .min(1, 'Confirm your new password'),
  })
  .refine(
    (values) =>
      values.newPassword === values.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    }
  )
  .refine(
    (values) =>
      values.currentPassword !== values.newPassword,
    {
      path: ['newPassword'],
      message:
        'New password must be different from the current password',
    }
  );

export type ProfileFormValues =
  z.infer<typeof profileSchema>;

export type ChangePasswordFormValues =
  z.infer<typeof changePasswordSchema>;
