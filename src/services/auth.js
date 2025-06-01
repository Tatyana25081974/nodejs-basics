
// src/services/auth.js
import { randomBytes } from 'crypto';// Використовується для генерації випадкових токенів
import bcrypt from 'bcrypt'; //Використовується для зашифрування паролів
import createHttpError from 'http-errors';

import { UsersCollection } from '../db/models/user.js'; //Модель MongoDB, що відповідає за збереження користувачів 
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js'; //Константи 
import { SessionsCollection } from '../db/models/session.js'; //Модель MongoDB, що відповідає за збереження access/refresh токенів.
import jwt from 'jsonwebtoken';//Використовується для генерації токенів 
import { SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
// Імпортуємо необхідні модулі
import handlebars from 'handlebars'; // Бібліотека для обробки шаблонів ({{...}})
import path from 'node:path'; // Модуль для роботи з шляхами
import fs from 'node:fs/promises'; // Асинхронне читання файлів
import { TEMPLATES_DIR } from '../constants/index.js';



export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

// 🔽 loginUser — це окрема функція, ЗА межами registerUser
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });//Шукаємо користувача з таким email.
  if (!user) {
    throw createHttpError(401, 'User not found'); //Якщо користувача не знайдено — викидаємо помилку 404.
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);//payload.password — це той, що ввів користувач (звичайний текст).
  //user.password — це зашифрований пароль, збережений у базі.
  //bcrypt.compare() розшифрує і скаже: паролі однакові (true) чи ні (false).
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });// Видаляємо стару сесію (refresh/access токени), якщо вона вже була.

  const accessToken = randomBytes(30).toString('base64');//Генеруємо нові токени (випадкові строки по 30 байт, закодовані в base64):для доступу 
  const refreshToken = randomBytes(30).toString('base64');//для оновлення доступу 

  return await SessionsCollection.create({ //Створюємо сесію в базі:
    userId: user._id, //кому належить
    accessToken, //токен для доступу
    refreshToken,//токен для оновлення
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES), // дата, до якої токен дійсний (15 хв)
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),//дата для refresh (1 день)
  });
};
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
const createSession = () => { //Це функція-шаблон для генерації сесії
  const accessToken = randomBytes(30).toString('base64');//randomBytes(30) — генерує випадкові токени,.toString('base64') — перетворює їх у зручний для зберігання рядок
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,//токен для доступу
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES), 
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => { //приймає sessionId та refreshToken із cookies або запиту.
  const session = await SessionsCollection.findOne({ //шукаємо сесію з конкретним ID та вірним токеном
    _id: sessionId,
    refreshToken,
  });
// якщо сесія не знайдена 
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
// перевіряємо чи токен вже недійсний 
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil); //Якщо теперішній час більше → токен вже недійсний

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  //Створюємо нову сесію
  const newSession = createSession(); //Генеруємо новий access/refresh токени з новими датами
  // Видаляємо стару сесію
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
// Зберігаємо нову сесію
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

//функція, яка генерує токен для скидання пароля й надсилає лист користувачу на email. 

//Знаходимо користувача по email

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  };

  //Генеруємо JWT токен для скидання пароля
  const resetToken = jwt.sign( //функція з бібліотеки jsonwebtoken, яка створює токен (підписує). Створює токен з userId і email, який живе 15 хвилин
    {
      sub: user._id,
      email,
    }, //Перший параметр — це payload:дані,які будуть включені в токен.
    getEnvVar('JWT_SECRET'), ////Другий параметр — секретний ключ:Цей ключ використовується для криптографічного підпису токена.Сервер потім зможе перевірити токен через jwt.verify().
    {
      expiresIn: '15m',
    },
  ); // Третій параметр — налаштування токена:вказує час дії токена

  //Визначаємо шлях до HTML-шаблону

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR, // Шлях до папки шаблонів (із константи)
    'reset-password-email.html', // Назва конкретного шаблону
  );

  //Зчитуємо шаблон HTML з файлу
  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath) // Зчитуємо файл шаблону
  ).toString(); // Перетворюємо Buffer у текст (HTML)

  //Компілюємо шаблон за допомогою Handlebars
  const template = handlebars.compile(templateSource); // Створюємо функцію з шаблону

  //Підставляємо значення у шаблон (name і посилання з токеном)
  const html = template({
    name: user.name, // Це замінить {{name}} у шаблоні
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`, // Це замінить {{link}}
  });


//Надсилаємо лист користувачу
  await sendEmail({    // Надсилає цей токен в листі користувачу
    from: getEnvVar(SMTP.SMTP_FROM), //Email-адреса, з якої надсилається лист (
    to: email, //це email користувача, який просить скидання пароля.
    subject: 'Reset your password',
    html,
  });   //Підставляється в HTML — це ключ для відновлення пароля
};

  

//refreshUsersSession обробляє запит на оновлення сесії користувача, перевіряє наявність і термін дії існуючої сесії, генерує нову сесію та зберігає її в базі даних.
