export function isInstitutionalEmail(email) {
  return /^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2})?$/i.test(email);
}

export function isStrongPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export function isValidPrice(value) {
  return !isNaN(value) && parseFloat(value) > 0;
}
