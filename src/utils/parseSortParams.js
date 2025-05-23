// src/utils/parseSortParams.js

import { SORT_ORDER } from "../constants/index.js";

const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder); //Якщо sortOrder — це 'asc' або 'desc' → використовуємо його.
  if (isKnownOrder) return sortOrder; //Якщо ні → повертаємо 'asc' за замовчуванням.
  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  const keysOfStudent = [
    '_id',
    'name',
    'age',
    'gender',
    'avgMark',
    'onDuty',
    'createdAt',
    'updatedAt',
  ]; //Це масив зі всіма полями студента, які можна використовувати для сортування.

  if (keysOfStudent.includes(sortBy)) {
    return sortBy;
  } //якщо значення sortBy (яке передав користувач через URL) є в списку keysOfStudent → ✅ тоді повертаємо його

  return '_id';
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
