
// src/services/auth.js
import { randomBytes } from 'crypto';// Використовується для генерації випадкових токенів
import bcrypt from 'bcrypt'; //Використовується для зашифрування паролів
import createHttpError from 'http-errors';

import { UsersCollection } from '../db/models/user.js'; //Модель MongoDB, що відповідає за збереження користувачів 
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js'; //Константи 
import { SessionsCollection } from '../db/models/session.js'; //Модель MongoDB, що відповідає за збереження access/refresh токенів.




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

//refreshUsersSession обробляє запит на оновлення сесії користувача, перевіряє наявність і термін дії існуючої сесії, генерує нову сесію та зберігає її в базі даних.
