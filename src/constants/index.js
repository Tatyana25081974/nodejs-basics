import path from 'node:path'; // Імпортуємо модуль для роботи з файлами і шляхами



export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc',
};
  
export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;


export const ROLES = {
    TEACHER: 'teacher',
    PARENT: 'parent',
};
export const SMTP = {
    SMTP_HOST: 'SMTP_HOST', //Ключ до .env для вказання адреси SMTP-сервера
    SMTP_PORT: 'SMTP_PORT', //Ключ до .env для вказання порту SMTP
    SMTP_USER: 'SMTP_USER',  //Ключ до .env для логіна до SMTP
    SMTP_PASSWORD: 'SMTP_PASSWORD', //Ключ до .env для пароля SMTP
    SMTP_FROM: 'SMTP_FROM', //Ключ до .env для email-адреси, з якої надсилаються листи
};
  
export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');  // змінна для зберігання шляху до шаблонів електронних листів 