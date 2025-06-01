import nodemailer from 'nodemailer'; //бібліотека, яка дозволяє надсилати електронні листи через SMTP (Simple Mail Transfer Protocol).

import { SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js'; //допоміжна функція, яка бере значення зі змінних середовища (.env) і, якщо воно не знайдено — викидає помилку.

const transporter = nodemailer.createTransport({ //створюється транспортер — обʼєкт, який підключається до поштового сервера.
  host: getEnvVar(SMTP.SMTP_HOST), //Адреса SMTP сервера (наприклад, smtp-relay.brevo.com)
  port: Number(getEnvVar(SMTP.SMTP_PORT)), //Порт сервера (587 для TLS або 465 для SSL)
  auth: {
    user: getEnvVar(SMTP.SMTP_USER), //Логін (зазвичай — email від Brevo)
    pass: getEnvVar(SMTP.SMTP_PASSWORD), //Пароль або токен SMTP (генерується в кабінеті Brevo)
  },
});

export const sendEmail = async (options) => { //Функція sendEmail надсилає лист,Приймає обʼєкт options (кому, від кого, тема, тіло листа тощо)
  return await transporter.sendMail(options); //Передає ці параметри у transporter.sendMail(...)  await чекає, поки пошта буде надіслана


};