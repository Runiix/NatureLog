/**
 * Account rules shared by the forms (instant feedback) and the server actions
 * (enforcement). The username ends up in every profile, collection and list
 * URL, so it is restricted to URL-safe characters.
 */

export const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;

export function isValidUsername(value: unknown): value is string {
  return typeof value === "string" && USERNAME_PATTERN.test(value);
}

/** ≥ 10 characters with upper case, lower case, a digit and a symbol. */
export function isStrongPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 10 &&
    value.length <= 128 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}
