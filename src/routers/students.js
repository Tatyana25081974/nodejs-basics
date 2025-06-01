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
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate);

router.get('/',checkRoles(ROLES.TEACHER), ctrlWrapper(getStudentsController));

router.get('/:studentId',checkRoles(ROLES.TEACHER, ROLES.PARENT),isValidId, ctrlWrapper(getStudentByIdController));

router.post('/',checkRoles(ROLES.TEACHER), validateBody(createStudentSchema),ctrlWrapper(createStudentController));  //Це middleware-функція, яка:

//перевіряє req.body за схемою createStudentSchema;

//якщо є помилки — зупиняє виконання і передає помилку;

//якщо все ок — передає управління далі.

router.delete('/:studentId', checkRoles(ROLES.TEACHER),isValidId, ctrlWrapper(deleteStudentController));

router.put(
  '/:studentId',checkRoles(ROLES.TEACHER),
  isValidId,
  validateBody(createStudentSchema),
  ctrlWrapper(upsertStudentController),
);
router.patch(
  '/:studentId',
  checkRoles(ROLES.TEACHER, ROLES.PARENT), // ✅ Виправлено!checkRoles(...) — це middleware, який перевіряє роль користувача.
  isValidId,
  validateBody(updateStudentSchema),
  ctrlWrapper(patchStudentController),
);

export default router;

