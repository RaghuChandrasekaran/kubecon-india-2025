// Currency utilities for consistent formatting throughout the app

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee'
};

/**
 * Formats a price value to Indian Rupee with proper number handling
 * @param price - The price value (number or string)
 * @param options - Formatting options
 * @returns Formatted price string with INR symbol
 */
export const formatPrice = (
  price: number | string | undefined | null, 
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  // Handle null/undefined cases
  if (price === null || price === undefined) {
    return showSymbol ? `${CURRENCY.symbol}0.00` : '0.00';
  }

  // Convert to number safely
  const numericPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
  
  // Handle NaN case
  if (isNaN(numericPrice)) {
    return showSymbol ? `${CURRENCY.symbol}0.00` : '0.00';
  }

  // Format the number
  const formatted = numericPrice.toLocaleString('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
    style: 'decimal'
  });

  return showSymbol ? `${CURRENCY.symbol}${formatted}` : formatted;
};

/**
 * Converts a price value to a safe number
 * @param price - The price value to convert
 * @returns A safe numeric value
 */
export const toSafeNumber = (price: number | string | undefined | null): number => {
  if (price === null || price === undefined) return 0;
  if (typeof price === 'number') return isNaN(price) ? 0 : price;
  
  const parsed = parseFloat(String(price));
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Creates a cart item with proper price handling
 * @param item - Base item data
 * @returns CartItem with safe numeric price and INR currency
 */
export const createCartItem = (item: {
  productId: string;
  sku: string;
  title: string;
  price: number | string;
  thumbnail?: string;
  quantity?: number;
}) => ({
  productId: item.productId,
  sku: item.sku,
  title: item.title,
  quantity: item.quantity || 1,
  price: toSafeNumber(item.price),
  currency: CURRENCY.code,
  thumbnail: item.thumbnail
});
