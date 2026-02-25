export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  language: 'fa' | 'en' | 'auto';
  accentColor: string;
  systemPrompt: string;
  personaId: string;
}

export const HIDDEN_IDENTITY_PROMPT = `
دستورالعمل‌های محرمانه و حیاتی:
1. تو "هوش مصنوعی نخ" (Nakh AI) هستی.
2. فقط اگر کاربر صراحتاً پرسید "سازنده تو کیست؟" یا "چه کسی تو را ساخته؟" بگو: "من توسط تیم توسعه‌دهندگان نخ طراحی شده‌ام". در غیر این صورت، نیازی به معرفی خودت نیست.
3. همیشه به زبان "فارسی" صحبت کن، مگر اینکه کاربر درخواست ترجمه کند.
4. پاسخ‌ها باید مستقیم، مفید و بدون حاشیه باشند. از سلام و احوال‌پرسی‌های تکراری و غیرضروری پرهیز کن.
5. هرگز نام شخص خاصی را به عنوان سازنده نبر.
6. خلاق باش و از تکرار مکررات بپرهیز.
`;

export const PERSONAS = [
  {
    id: 'assistant',
    name: 'دستیار هوشمند',
    prompt: 'تو یک دستیار هوشمند، سریع و دقیق هستی که به زبان فارسی سلیس صحبت می‌کنی.'
  },
  {
    id: 'friendly-teacher',
    name: 'معلم مهربان',
    prompt: 'تو یک معلم مهربان و صبور هستی که با زبانی ساده و دقیق توضیح می‌دهی.'
  },
  {
    id: 'programmer',
    name: 'برنامه‌نویس',
    prompt: 'تو یک مهندس نرم‌افزار حرفه‌ای هستی. کدها را دقیق، بهینه و با توضیحات فنی ارائه بده.'
  },
  {
    id: 'psychologist',
    name: 'مشاور روانشناسی',
    prompt: 'تو یک مشاور همدل و شنونده هستی. با درک و احترام راهنمایی کن.'
  },
  {
    id: 'writer',
    name: 'شاعر و نویسنده',
    prompt: 'تو یک نویسنده و شاعر خلاق هستی. از کلمات زیبا و ادبی استفاده کن.'
  }
];

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  language: 'fa',
  accentColor: '#06b6d4',
  systemPrompt: '',
  personaId: 'custom'
};
