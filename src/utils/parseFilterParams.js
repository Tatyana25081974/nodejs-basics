// src/utils/parseFilterParams.js

//Ця утиліта parseFilterParams():

//Перетворює ці рядки на числа

//Перевіряє, чи значення правильні

//Повертає зручний об'єкт для фільтрації в MongoDB



const parseGender = (gender) => {
    const isString = typeof gender === 'string';
    if (!isString) return;
    const isGender = (gender) => ['male', 'female', 'other'].includes(gender);
  
    if (isGender(gender)) return gender;
  };
  
  const parseNumber = (number) => {
    const isString = typeof number === 'string'; //Приймає рядок типу '10'
    if (!isString) return; //Якщо це не рядок → повертає undefined
  
    const parsedNumber = parseInt(number); //Інакше — перетворює на число через parseInt()
    if (Number.isNaN(parsedNumber)) { //Якщо це не число (NaN) → повертає undefined


      return;
    }
  
    return parsedNumber; //Інакше — повертає вже справжнє число
  };
  
  export const parseFilterParams = (query) => {    // функція, яка приймає об'єкт query — зазвичай це req.query з Express.
    //Вона буде обробляти фільтри, які приходять з URL-запиту.
    const { gender, maxAge, minAge, maxAvgMark, minAvgMark } = query;
  
    const parsedGender = parseGender(gender);
    const parsedMaxAge = parseNumber(maxAge);
    const parsedMinAge = parseNumber(minAge);
    const parsedMaxAvgMark = parseNumber(maxAvgMark);
    const parsedMinAvgMark = parseNumber(minAvgMark);
  
    return {
      gender: parsedGender,
      maxAge: parsedMaxAge,
      minAge: parsedMinAge,
      maxAvgMark: parsedMaxAvgMark,
      minAvgMark: parsedMinAvgMark,
    };
  };
  