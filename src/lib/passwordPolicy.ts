export const ADMIN_PASSWORD_MIN_LENGTH = 8;

const ADMIN_PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export function isStrongAdminPassword(password: string): boolean {
  return ADMIN_PASSWORD_POLICY_REGEX.test(password);
}
