import { DateService } from '../services/DateService';

export function getLocalDateString(date?: Date): string {
  return DateService.getLocalDateString(date);
}

export function getStartOfWeek(date?: Date): Date {
  return DateService.getStartOfWeek(date);
}

export function getEndOfWeek(date?: Date): Date {
  return DateService.getEndOfWeek(date);
}

export function getStartOfLastWeek(): Date {
  return DateService.getStartOfLastWeek();
}

export function getEndOfLastWeek(): Date {
  return DateService.getEndOfLastWeek();
}
