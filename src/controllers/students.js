// src/controllers/students.js
import createHttpError from 'http-errors';
import { getAllStudents, getStudentById } from '../services/students.js';
import { createStudent } from '../services/students.js';
import { deleteStudent } from "../services/students.js";
import { updateStudent } from "../services/students.js";

export const getStudentsController = async (req, res) => {
 const students = await getAllStudents();

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
//upsert = update + insert. оновлюємо +створюємо

  export const upsertStudentController = async (req, res, next) => { 
    const { studentId } = req.params; // Отримуємо айді студента
  
    const result = await updateStudent(studentId, req.body, {  // req.body — нові дані студента (повинні бути в тілі запиту )
      upsert: true, // каже MongoDB: якщо немає такого студента — створи нового. Якщо такий студент існує -оновлюємо його дані
    });
  
    if (!result) {
      next(createHttpError(404, 'Student not found'));
      return;
    }
  
    const status = result.isNew ? 201 : 200; //201 - створено, 200 - оновлено 
  
    res.status(status).json({
      status, //повертаємо 201 якщо створено, 200 якщо оновлено 
      message: `Successfully upserted a student!`,
      data: result.student, //повертаємо студента 
    });
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

