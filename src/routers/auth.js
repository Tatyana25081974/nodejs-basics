// src/routers/auth.js

import { Router } from 'express';//головна бібліотека для створення серверу
import { ctrlWrapper } from '../utils/ctrlWrapper.js'; //утіліта для обгортки контролерів , вона автоматично ловить помилку в async/await
import { registerUserSchema } from '../validation/auth.js';//Joi-схема, яка  описує правила для об'єкта користувача 
import { registerUserController } from '../controllers/auth.js';//контролер який відповідає за реєстрацію користувача .отримує req, обробляє реєстрацію користувача через сервіс, і повертає JSON-відповідь.
import { validateBody } from '../middlewares/validateBody.js';//кастомний middleware, який буде виконувати валідацію тіла запиту.middleware, який перевіряє, чи тіло запиту (req.body) відповідає схемі registerUserSchema.

const router = Router();

router.post(
  '/register', //HTTP-запит, який клієнт (браузер, мобільний застосунок або Postman) надсилає на сервер, щоб створити нового користувача в системі.
  validateBody(registerUserSchema), //спочатку перевіряються дані (валідація)
  ctrlWrapper(registerUserController),//потім виконується логіка реєстрації користувача
);

export default router;
