// src/services/auth.js

import { UsersCollection } from '../db/models/user.js';

export const registerUser = async (payload) => {
  return await UsersCollection.create(payload);
};
//🔸 Це асинхронна функція registerUser, яка:

//приймає payload — об’єкт із даними користувача (наприклад, { name, email, password });

//Використовує UsersCollection.create() — це метод Mongoose, який додає новий документ (користувача) у базу даних;

//Повертає результат — нового користувача, який було збережено.

