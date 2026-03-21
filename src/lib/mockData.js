export const CATEGORIES = [
  { id: 'development', label: 'פיתוח תוכנה', icon: '💻' },
  { id: 'design', label: 'עיצוב גרפי', icon: '🎨' },
  { id: 'marketing', label: 'שיווק דיגיטלי', icon: '📣' },
  { id: 'content', label: 'כתיבת תוכן', icon: '✍️' },
  { id: 'video', label: 'וידאו ועריכה', icon: '🎬' },
  { id: 'data', label: 'דאטה ואנליטיקס', icon: '📊' },
  { id: 'devops', label: 'DevOps & Cloud', icon: '☁️' },
  { id: 'mobile', label: 'אפליקציות מובייל', icon: '📱' },
];

export const mockBots = [];

export const mockOrders = [
  {
    id: 'ord1',
    bot_id: '1',
    bot_name: 'אורי כהן — Full Stack Dev',
    freelancer_email: 'uri@example.com',
    client_email: 'demo@jobly.co.il',
    tier: 'standard',
    price: 1500,
    status: 'in_progress',
    created_date: '2024-01-15',
    rating: null,
    review: null,
  },
  {
    id: 'ord2',
    bot_id: '2',
    bot_name: 'מאיה ברק — UX/UI Designer',
    freelancer_email: 'maya@example.com',
    client_email: 'demo@jobly.co.il',
    tier: 'basic',
    price: 400,
    status: 'completed',
    created_date: '2024-01-01',
    rating: 5,
    review: 'עבודה מדהימה!',
  },
];

export const mockUser = {
  id: 'user1',
  email: 'demo@jobly.co.il',
  full_name: 'ישראל ישראלי',
  role: 'admin',
  is_admin: true,
  user_type: 'freelancer',
  avatar_url: 'https://i.pravatar.cc/150?img=12',
  bio: 'פרילנסר עם ניסיון של 5 שנים בפיתוח ועיצוב',
  headline: 'Full Stack Developer & Designer',
  whatsapp: '0501234567',
};
