// src/server.js

import express from 'express'; //головна бібліотека для створення серверу.


import pino from 'pino-http'; //логер, який виводить інформацію про запити (наприклад: метод, шлях, час).
import cors from 'cors'; //дозволяє іншим сайтам звертатись до твого API (дуже важливо для фронтенду).

import router from './routers/index.js'; // Імпортуємо роутер
import { getEnvVar } from './utils/getEnvVar.js';

// Імпортуємо middleware
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';


//Отримуємо порт, на якому запускатиметься сервер

const PORT = Number(getEnvVar('PORT', '3000')); //getEnvVar — допоміжна функція для читання змінних середовища. Якщо PORT не задано, буде 3000.

//Основна функція запуску сервера.Створюється об’єкт app, який і є нашим сервером.
export const startServer = () => {
  const app = express();

  //Налаштування middleware (середовища для обробки запитів)
  app.use(express.json()); //Всі вхідні запити з JSON тілом (наприклад, POST) будуть автоматично розпарсені.
  app.use(cors());//Дозволяє frontend-додаткам з інших доменів (наприклад, localhost:5173) звертатися до API (localhost:3000).
  //підключення логера
  app.use(cookieParser());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  //Головна сторінка сервера.Якщо користувач відкриває корінь сайту (GET /), сервер відповідає текстом 'Hello World!'.
  app.get('/', (req, res) => {
    res.json({
      message: 'Hello World!',
    });
  });
// Підключення роутера для /students
app.use(router); // Додаємо роутер до app як middleware
//Обробка 404 (неіснуючі маршрути)
  app.use('*', notFoundHandler);
//Обробка помилок
app.use(errorHandler);
//Запуск сервера
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
