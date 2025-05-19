// src/utils/parsePaginationParams.js

const parseNumber = (number, defaultValue) => { //parseNumber — це функція, яка намагається перетворити значення (зазвичай із req.query) на число. Якщо не вдається — повертає дефолтне.
    const isString = typeof number === 'string';//Квері-параметри завжди приходять у вигляді рядків ('5', '12').
    if (!isString) return defaultValue; //Якщо параметр не рядок, значить, це щось дивне → повертаємо defaultValue.
  
    const parsedNumber = parseInt(number); //parseInt() — це вбудована функція JavaScript, яка перетворює рядок у ціле числ
    //Як вона працює?
//Вона читає символи зліва направо.

//Зупиняється, коли зустрічає щось, що не є частиною числа.

//Якщо не знаходить жодної цифри — повертає NaN.
    if (Number.isNaN(parsedNumber)) {
      return defaultValue;
    }
  
    return parsedNumber;
  };
  
  export const parsePaginationParams = (query) => {
    const { page, perPage } = query;
  
    const parsedPage = parseNumber(page, 1);
    const parsedPerPage = parseNumber(perPage, 10);
  
    return {
      page: parsedPage,
      perPage: parsedPerPage,
    };
  };