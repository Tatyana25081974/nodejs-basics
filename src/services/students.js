// src/services/students.js 
import { StudentsCollection } from '../db/models/students.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';



export const getAllStudents = async ({ 
  page = 1,
    perPage = 10,
    sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  //Це потрібно для MongoDB-пагінації:
//– наприклад, page=2, perPage=5 → пропускаємо перших 5, беремо наступні 5.
  const limit = perPage; // кількість записів на одну сторінку
  const skip = (page - 1) * perPage; // кількість записів, які потрібно пропустити

  


  const studentsQuery = StudentsCollection.find(); //Це підготовка запиту до MongoDB — отримати всіх студентів.

  if (filter.gender) {
    studentsQuery.where('gender').equals(filter.gender);
  }
  if (filter.maxAge) {
    studentsQuery.where('age').lte(filter.maxAge);
  }
  if (filter.minAge) {
    studentsQuery.where('age').gte(filter.minAge);
  }
  if (filter.maxAvgMark) {
    studentsQuery.where('avgMark').lte(filter.maxAvgMark);
  }
  if (filter.minAvgMark) {
    studentsQuery.where('avgMark').gte(filter.minAvgMark);
  }

  //4. Підраховує загальну кількість записів:

  /* Замість цього коду */
  //const studentsCount = await StudentsCollection.find()
    //.merge(studentsQuery) //це гарантія, що якщо в studentsQuery буде фільтрація (наприклад, за gender, age) — вона застосується і тут.Копіюємо всі фільтри й сортування
   // .countDocuments(); //рахуємо загальну кількість відповідних записів.Рахуємо, скільки студентів відповідають цьому
//const students = await studentsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec(); //Виконуємо Mongo-запит:.skip(skip) — пропускає n записів, .limit(limit) — бере limit записів,.exec() — виконує запит і повертає результат 
/* Ми можемо написати такий код */

const [studentsCount, students] = await Promise.all([
  StudentsCollection.find().merge(studentsQuery).countDocuments(),
  studentsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec(),
]);
  const paginationData = calculatePaginationData(studentsCount, perPage, page);//рахуємо загальну кількість відповідних записів .calculatePaginationData, яка обраховує і повертає дані для пагінації, зокрема інформацію про загальну кількість сторінок і чи є наступна чи попередня сторінка.



  return {
    data: students,
    ...paginationData,
  };
};

//Цей return:

//обʼєднує самі дані (масив студентів)

//додає дані про пагінацію

//і віддає їх контролеру, який повертає у відповідь клієнту

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