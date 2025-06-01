// src/controllers/auth.js

// контролер — частина, яка отримує HTTP-запит від клієнта (наприклад, браузера або Postman), викликає бізнес-логіку (сервіс), і надсилає відповідь.

// цей конторолер відповідає за реєстрацію користувача 
import { ONE_DAY } from '../constants/index.js';
import { loginUser } from '../services/auth.js';
import { registerUser } from '../services/auth.js';
import { logoutUser } from '../services/auth.js';
import { refreshUsersSession } from '../services/auth.js';
import { requestResetToken } from '../services/auth.js';




export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);// Отримуємо дані користувача з тіла запиту (req.body) — це об'єкт, надісланий клієнтом (зазвичай: name, email, password),
//і передаємо ці дані до сервісної функції registerUser, яка:створює нового користувача в MongoDB. повертає створений об'єкт

res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body); //виклик сервісу логіну, який повертає об'єкт з токенами 

  res.cookie('refreshToken', session.refreshToken, { //Функція встановлює два куки: refreshToken і sessionId, використовуючи метод res.cookie.
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  }); //refreshToken зберігається як http-only cookie, що означає, що він доступний тільки через HTTP-запити і не може бути доступним через JavaScript на стороні клієнта. Він має термін дії один день.
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  }); //також зберігається як http-only cookie з аналогічним терміном дії.

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) { //перевіряє, чи існує кукі sessionId у запиті. Якщо sessionId присутній, функція викликає logoutUser, передаючи їй значення sessionId
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

//Браузер автоматично надсилає cookies: refreshToken і sessionId

//Контролер перевіряє сесію і refresh токен

//Генерує нову сесію з новими токенами

//Встановлює нові куки

//Повертає новий access токен у відповідь

const setupSession = (res, session) => { //Ця функція "встановлює" HTTP-only cookies на відповідь сервера.
  res.cookie('refreshToken', session.refreshToken, { //з ім'ям refreshToken і значенням sesion.refreshToken.метод Express для створення cookie
    httpOnly: true, //захищена тільки через HTTP-запит
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};
//створюємо об'єкт session
export const refreshUserSessionController = async (req, res) => { //контролер, який буде викликатись, коли клієнт надсилає запит на /refresh.
  const session = await refreshUsersSession({ //приймає sessionId та refreshToken із cookies або запиту
    sessionId: req.cookies.sessionId, //викликає refreshUsersSession
    refreshToken: req.cookies.refreshToken, //та передає їм дані 
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};