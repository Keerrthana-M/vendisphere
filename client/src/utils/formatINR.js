/**
 * Format a number as Indian Rupees (₹)
 * Usage: formatINR(1499) => "₹1,499.00"
 */
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0)
