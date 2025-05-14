// src/services/students.js 
import { StudentsCollection } from '../db/models/student.js';

export const getAllStudents = async () => {
  const students = await StudentsCollection.find();
  return students;
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
    { _id: studentId },// ID студента, якого потрібно оновити.
    payload, //об’єкт з новими даними для оновлення
    {
      new: true,  //повертає оновлений документ відмінно від оригинального
      includeResultMetadata: true, //повертає метадані оновленого документа 
      ...options, //додаткові опциї
    },
  );
 //Перевірка результату:
  if (!rawResult || !rawResult.value) return null;
  //Якщо документ не знайдено або не оновлено, функція поверне null
  
  //Повертаємо об'єкт, що містить оновленного студента та інформацію про його стан
  return {
    student: rawResult.value, //оновлений студент з бази даних
    isNew: Boolean(rawResult?.lastErrorObject?.upserted), //повертає true,якщо документ створено і false,якщо документ оновлено з бази даних
  };
};