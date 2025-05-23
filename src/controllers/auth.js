// src/controllers/auth.js

// контролер — частина, яка отримує HTTP-запит від клієнта (наприклад, браузера або Postman), викликає бізнес-логіку (сервіс), і надсилає відповідь.

// цей конторолер відповідає за реєстрацію користувача 

import { registerUser } from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);// Отримуємо дані користувача з тіла запиту (req.body) — це об'єкт, надісланий клієнтом (зазвичай: name, email, password),
//і передаємо ці дані до сервісної функції registerUser, яка:створює нового користувача в MongoDB. повертає створений об'єкт

res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};
