/**
 * Application-wide business constants
 */
export const APP_CONSTANTS = {
  APP_NAME: 'Balaji Fresh',
  IS_DEMO: true,
  DEMO_LABEL: 'DEMO VERSION',
  CURRENCY_SYMBOL: '₹',
  DEFAULT_COUNTRY_CODE: '+91',
  FREE_DELIVERY_THRESHOLD: 249,
  DEFAULT_PACKING_CHARGE: 0,
  DEFAULT_DELIVERY_FEE: 30,
  MORNING_SLOT: {
    label: 'Morning Doorstep Delivery',
    timeRange: '8:00 AM - 12:00 PM',
    tag: 'EARLY FRESH',
  },
} as const;
