/** رده‌های مقاومتی بتن — از کم‌مقاومت تا پرمقاومت */
export const CONCRETE_GRADES = [
  'C8',
  'C10',
  'C12',
  'C14',
  'C16',
  'C20',
  'C22',
  'C25',
  'C28',
  'C30',
  'C32',
  'C35',
  'C37',
  'C40',
  'C42',
  'C45',
  'C50',
  'C55',
  'C60',
  'C65',
  'C70',
  'C80',
  'C90',
  'C100',
] as const;

export type ConcreteGrade = (typeof CONCRETE_GRADES)[number];
