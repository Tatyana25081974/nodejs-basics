// src/middlewares/validateBody.js

// роутер, який описує URL-адреси та те, що виконати при запиті до них (який контролер, яка валідація тощо).

// Імпортуємо класс HttpError для обробки помилок HTTP з відповідними статус кодами та повідомленнями 

import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, {
      abortEarly: false,//виводить всі помилки валідації
    });
    next();
  } catch (err) {
    const error = createHttpError(400, 'Bad Request', {
      errors: err.details,
    });
    next(error);
  }
};
