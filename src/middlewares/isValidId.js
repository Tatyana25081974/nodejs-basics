import { isValidObjectId } from 'mongoose';  //Це функція з Mongoose, яка перевіряє:
//👉 чи є рядок коректним MongoDB ObjectId.
import createHttpError from 'http-errors';//утиліта для створення стандартних HTTP-помилок.

export const isValidId = (req, res, next) => {
  const { studentId } = req.params;  //Витягуємо studentId з параметрів запиту.
  if (!isValidObjectId(studentId)) {
    throw createHttpError(400, 'Bad Request'); //тоді кидається помилка 400 Bad Request — неправильний формат запиту.
  }

  next(); //Якщо studentId коректний — переходимо до наступного middleware або контролера.
};