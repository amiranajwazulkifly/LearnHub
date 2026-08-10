// Shared border/focus classes for form inputs — swaps to a red border/ring
// when the field has a validation error, instead of always showing the
// same brand-colored focus ring regardless of validity.
export function fieldBorderClasses(hasError?: boolean): string {
  return hasError
    ? "border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-600"
    : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/30 dark:border-gray-700";
}
