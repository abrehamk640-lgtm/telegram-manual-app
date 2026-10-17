// ORDER_ENDPOINT: URL of your API that receives orders (leave '' to send via Telegram bot sendData).
export const CONFIG = { ORDER_ENDPOINT: '' };

// Payment methods. Labels live in locales as `pay_<id>`. Put your real account numbers here.
export const PAYMENTS = [
  { id: 'telebirr', icon: '📲', account: '09XXXXXXXX' },
  { id: 'cbe', icon: '🏦', account: '1000XXXXXXXXX' },
  { id: 'bank', icon: '💳', account: 'Bank name / account number' },
  { id: 'cash', icon: '💵', account: '' },
];
