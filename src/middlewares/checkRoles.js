// src/middlewares/checkRoles.js

import createHttpError from 'http-errors';

import { StudentsCollection } from '../db/models/students.js';
import { ROLES } from '../constants/index.js';
//Прийняття ролей:
export const checkRoles =  //Функція checkRoles приймає необмежену кількість ролей як аргументи і повертає асинхронну функцію-обробник запиту.
  (...roles) =>
  async (req, res, next) => { //Обробник запиту приймає об'єкти запиту (req), відповіді (res) і наступної функції (next).
    const { user } = req; //Витягується об'єкт користувача з запиту (req.user).
    if (!user) {
      next(createHttpError(401)); //Якщо користувач відсутній, викликається помилка з кодом 401 і передається до наступної функції.
      return;
    }
//Перевірка ролі користувача:
    const { role } = user; //Витягується роль користувача з об'єкта користувача (user.role).
    if (roles.includes(ROLES.TEACHER) && role === ROLES.TEACHER) { // масив roles містить роль TEACHER, а роль користувача є TEACHER.
      next(); //Якщо роль користувача відповідає одній з переданих ролей, доступ дозволяється, і викликається наступна функція (next).
      return;
    }

    if (roles.includes(ROLES.PARENT) && role === ROLES.PARENT) { //Якщо роль користувача PARENT і вона є в масиві ролей, перевіряється наявність studentId у параметрах запиту (req.params).
      const { studentId } = req.params;
      if (!studentId) {
        next(createHttpError(403)); //Якщо studentId відсутній, викликається помилка з кодом 403 і передається до наступної функції.
        return;
      }

      const student = await StudentsCollection.findOne({
        _id: studentId,
        parentId: user._id,
      }); //Якщо studentId присутній, функція шукає студента в колекції StudentsCollection, перевіряючи, чи відповідає ідентифікатор студента та ідентифікатор батька (користувача).

      if (student) {
        next();
        return;
      } //Якщо студент знайдений, доступ дозволяється, і викликається наступна функція.

    }

    next(createHttpError(403)); //Якщо жодна з перевірок не пройдена, викликається помилка з кодом 403 і передається до наступної функції.
  };
