/**
 * Validate 10-digit Indian Mobile Number
 */
export function validateIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Exactly 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Format phone number as "98765 43210"
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length > 10 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  }
  cleaned = cleaned.slice(0, 10);
  if (cleaned.length > 5) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return cleaned;
}

/**
 * Validate 4-digit SMS OTP
 */
export function validateOtp(otp: string): boolean {
  return /^\d{4}$/.test(otp.trim());
}
