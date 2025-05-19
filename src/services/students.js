// src/services/students.js 
import { StudentsCollection } from '../db/models/student.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';



export const getAllStudents = async ({ page, perPage }) => {
  const limit = perPage; // кількість записів на одну сторінку
  const skip = (page - 1) * perPage; // кількість записів, які потрібно пропустити 

  const studentsQuery = StudentsCollection.find(); //Це підготовка запиту до MongoDB — отримати всіх студентів.
  const studentsCount = await StudentsCollection.find()
    .merge(studentsQuery) //це гарантія, що якщо в studentsQuery буде фільтрація (наприклад, за gender, age) — вона застосується і тут.
    .countDocuments(); //рахуємо загальну кількість відповідних записів.

  const students = await studentsQuery.skip(skip).limit(limit).exec(); //Виконуємо Mongo-запит:.skip(skip) — пропускає n записів, .limit(limit) — бере limit записів,.exec() — виконує запит і повертає результат 

  const paginationData = calculatePaginationData(studentsCount, perPage, page);//рахуємо загальну кількість відповідних записів .calculatePaginationData, яка обраховує і повертає дані для пагінації, зокрема інформацію про загальну кількість сторінок і чи є наступна чи попередня сторінка.



  return {
    data: students,
    ...paginationData,
  };
};

export const getStudentById = async (studentId) => {
  const student = await StudentsCollection.findById(studentId);
  return student;
};

//функція, яка буде записувати отримані дані (payload) у базу даних.
export const createStudent = async (payload) => {
  const student = await StudentsCollection.create(payload);
  return student;
};
export const deleteStudent = async (studentId) => {
  const student = await StudentsCollection.findOneAndDelete({
    _id: studentId,
  });

  return student;
};
export const updateStudent = async (studentId, payload, options = {}) => {
  const rawResult = await StudentsCollection.findOneAndUpdate(
    { _id: studentId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    student: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};