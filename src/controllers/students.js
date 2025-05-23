// src/controllers/students.js
import createHttpError from 'http-errors';
import { getAllStudents, getStudentById } from '../services/students.js';
import { createStudent } from '../services/students.js';
import { deleteStudent } from "../services/students.js";
import { updateStudent } from "../services/students.js";
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';


export const getStudentsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);

  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const students = await getAllStudents({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Successfully found students!',
    data: students,
  });
};
export const getStudentByIdController = async (req, res) => {
 const { studentId } = req.params;
 const student = await getStudentById(studentId);

 // Відповідь, якщо контакт не знайдено
 //if (!student) {
// res.status(404).json({
	// message: 'Student not found'
// });
 //return;
    //}
    // А тепер додаємо базову обробку помилки замість res.status(404)
  if (!student) {
   // 2. Створюємо та налаштовуємо помилку
    throw createHttpError(404, 'Student not found'); //В імпортовану функцію передаємо 2 аргументи. Першим — код помилки, а другим — рядок, що містить опис помилки для об'єкта відповіді.
  }

  // Відповідь, якщо контакт знайдено
 res.json({
 status: 200,
 message: `Successfully found student with id ${studentId}!`,
 data: student,
 });
};

export const createStudentController = async (req, res) => {
  const student = await createStudent(req.body);
  res.status(201).json({
    status: 201,
    message: `Successfully created a student!`,
    data: student,
  });
};

export const deleteStudentController = async (req, res, next) => {
  const { studentId } = req.params;

  const student = await deleteStudent(studentId);

  if (!student) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  res.status(204).send();
};

export const upsertStudentController = async (req, res, next) => {
  const { studentId } = req.params; // знаходимо id стулента 

  const result = await updateStudent(studentId, req.body, {
    upsert: true,
  });   //оновлюємо студента

  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  } // якщо незнайдено студена -відправляємо помилку 

  const status = result.isNew ? 201 : 200; // відправляємо 201

  res.status(status).json({
    status,
    message: `Successfully upserted a student!`,
    data: result.student,
  }); //відправляємо 200
};

export const patchStudentController = async (req, res, next) => {
  const { studentId } = req.params;
  const result = await updateStudent(studentId, req.body);

  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully patched a student!`,
    data: result.student,
  });
};
