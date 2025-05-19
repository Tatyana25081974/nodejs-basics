// src/routers/students.js 

import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js'; //кастомний middleware, який буде виконувати валідацію тіла запиту.
import { createStudentSchema } from '../validation/students.js'; //Joi-схема, яка описує правила для об'єкта студента.
import { updateStudentSchema } from '../validation/students.js';
import { isValidId } from '../middlewares/isValidId.js';

import {
  getStudentsController,
  getStudentByIdController,
  createStudentController,
  deleteStudentController,
  upsertStudentController,
  patchStudentController,
} from '../controllers/students.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js'; //утиліта для обгортки контролерів. Вона автоматично ловить помилки у async/await функціях і передає їх у next(error).

const router = Router();

router.get('/students', ctrlWrapper(getStudentsController));

router.get('/students/:studentId',isValidId, ctrlWrapper(getStudentByIdController));

router.post('/students', validateBody(createStudentSchema),ctrlWrapper(createStudentController));  //Це middleware-функція, яка:

//перевіряє req.body за схемою createStudentSchema;

//якщо є помилки — зупиняє виконання і передає помилку;

//якщо все ок — передає управління далі.

router.delete('/students/:studentId', ctrlWrapper(deleteStudentController));

router.put(
  '/students/:studentId',
  isValidId,
  validateBody(createStudentSchema),
  ctrlWrapper(upsertStudentController),
);
router.patch(
  '/students/:studentId',
  isValidId,
  validateBody(updateStudentSchema),
  ctrlWrapper(patchStudentController),
);

export default router;

//Чому такий порядок?
//Express виконує middleware зліва направо, тому:

//Спочатку перевіряємо, чи studentId — валідний (isValidId)

//Потім валідуємо req.body, якщо є (validateBody(...))

//І тільки після цього — викликаємо контролер (ctrlWrapper(...))