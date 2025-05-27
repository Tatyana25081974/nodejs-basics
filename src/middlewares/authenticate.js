// src/middlewares/authenticate.js

import createHttpError from 'http-errors';

import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

//Перевірка заголовка авторизації:

export const authenticate = async (req, res, next) => { //Функція приймає об'єкти запиту (req), відповіді (res) і наступної функції (next).
  const authHeader = req.get('Authorization'); // отримує заголовок авторизації за допомогою req.get('Authorization').

  if (!authHeader) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }  //Якщо заголовок авторизації не надано, функція викликає помилку з кодом 401 (Будь ласка, надайте заголовок авторизації) і передає її до наступної функції за допомогою next.

    //Перевірка типу заголовка та наявності токена:
  const bearer = authHeader.split(' ')[0];
  const token = authHeader.split(' ')[1];

  if (bearer !== 'Bearer' || !token) {
    next(createHttpError(401, 'Auth header should be of type Bearer'));
    return;
  } //Якщо тип заголовка не "Bearer" або токен відсутній, функція викликає помилку з кодом 401 (Заголовок авторизації повинен бути типу Bearer) і передає її до наступної функції.

    
    //Перевірка наявності сесії:
  const session = await SessionsCollection.findOne({ accessToken: token }); //Функція шукає сесію в колекції SessionsCollection за наданим токеном доступу.

  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  } //Якщо сесію не знайдено, функція викликає помилку з кодом 401 (Сесію не знайдено) і передає її до наступної функції.

    //Перевірка терміну дії токена доступу:
  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil); //Функція перевіряє, чи не минув термін дії токена доступу, порівнюючи поточну дату з датою закінчення дії токена.

  if (isAccessTokenExpired) {
    next(createHttpError(401, 'Access token expired'));
  } //Якщо токен прострочений, функція викликає помилку з кодом 401 (Токен доступу прострочений) і передає її до наступної функції.

    //Пошук користувача:
  const user = await UsersCollection.findById(session.userId); //Функція шукає користувача в колекції UsersCollection за ідентифікатором користувача, який зберігається в сесії.

  if (!user) {
    next(createHttpError(401));
    return;
    } //Якщо користувача не знайдено, функція викликає помилку з кодом 401 і передає її до наступної функції.
    
//Додавання користувача до запиту:
  req.user = user; //Якщо всі перевірки успішні, функція додає об'єкт користувача до запиту (req.user = user).

  next(); //Викликається наступна функція за допомогою next, що дозволяє продовжити обробку запиту.
};
