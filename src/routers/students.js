// src/routers/students.js 

import { Router } from 'express';

import {
  getStudentsController,
  getStudentByIdController,
  createStudentController,
  deleteStudentController,
  upsertStudentController,
  patchStudentController,
} from '../controllers/students.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js'; //утиліта для обгортки контролерів. Вона автоматично ловить помилки у async/await функціях і передає їх у next(error).
import { validateBody } from '../middlewares/validateBody.js'; //кастомний middleware, який буде виконувати валідацію тіла запиту.
import { isValidId } from '../middlewares/isValidId.js';
import { createStudentSchema } from '../validation/students.js'; //Joi-схема, яка описує правила для об'єкта студента.
import { updateStudentSchema } from '../validation/students.js';


const router = Router();

router.get('/', ctrlWrapper(getStudentsController));

router.get('/:studentId',isValidId, ctrlWrapper(getStudentByIdController));

router.post('/', validateBody(createStudentSchema),ctrlWrapper(createStudentController));  //Це middleware-функція, яка:

//перевіряє req.body за схемою createStudentSchema;

//якщо є помилки — зупиняє виконання і передає помилку;

//якщо все ок — передає управління далі.

router.delete('/:studentId', ctrlWrapper(deleteStudentController));

router.put(
  '/:studentId',
  isValidId,
  validateBody(createStudentSchema),
  ctrlWrapper(upsertStudentController),
);
router.patch(
  '/:studentId',
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