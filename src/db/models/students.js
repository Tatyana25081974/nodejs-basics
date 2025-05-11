 // src/db/models/student.js 
import { Schema, model } from 'mongoose';

const studentsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    avgMark: {
      type: Number,
      required: true,
    },
    onDuty: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,  // встановлює значення true, щоб автоматично створювати поля createdAt та updatedAt, які вказують на час створення та оновлення документа.
    versionKey: false, //вказує, чи має бути створене поле __v для відстеження версій документу. У нашому випадку ми встановлюємо false, щоб це поле не створювалося.
  },
);
export const StudentsCollection = model('students', studentsSchema);