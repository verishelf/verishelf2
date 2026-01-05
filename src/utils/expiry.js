export function daysUntilExpiry(date) {
  const today = new Date();
  const expiry = new Date(date);
  const diff = expiry - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatus(date) {
  const days = daysUntilExpiry(date);

  if (days < 0) return "EXPIRED";
  if (days <= 3) return "WARNING";
  return "SAFE";
}
