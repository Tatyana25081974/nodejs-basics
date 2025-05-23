// src/db/models/user.js
import { model, Schema } from 'mongoose';

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
    { timestamps: true, versionKey: false },// додати два поля автоматично до кожного користувача (або іншого документа):
    //createdAt	Дата і час, коли документ було створено
    //updatedAt	Дата і час, коли документ востаннє змінено
    //MongoDB автоматично додає технічне поле __v до кожного документа. Це "ключ версії" — використовується для внутрішнього відстеження змін документа.
);

export const UsersCollection = model('users', usersSchema);
