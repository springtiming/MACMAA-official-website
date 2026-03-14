const PHONE_ALLOWED_CHARACTERS = /^\+?[\d\s().-]+$/;

export function isValidVolunteerPhoneNumber(value: string): boolean {
  const phone = value.trim();

  if (!phone) {
    return false;
  }

  if (!PHONE_ALLOWED_CHARACTERS.test(phone)) {
    return false;
  }

  const plusMatches = phone.match(/\+/g) ?? [];
  if (
    plusMatches.length > 1 ||
    (plusMatches.length === 1 && !phone.startsWith("+"))
  ) {
    return false;
  }

  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
