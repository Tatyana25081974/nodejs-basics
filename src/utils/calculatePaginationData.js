// src/utils/calculatePaginationData.js

export const calculatePaginationData = (count, perPage, page) => {
    const totalPages = Math.ceil(count / perPage);//Math.ceil() -це вбудована функція,яка округлює число до  найбільшого цілого 
    const hasNextPage = Boolean(totalPages - page); //перетворює значення на boolean 
    const hasPreviousPage = page !== 1;// індикатор попередньої сторінки 
  
    return {
      page,
      perPage,
      totalItems: count,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  };
  