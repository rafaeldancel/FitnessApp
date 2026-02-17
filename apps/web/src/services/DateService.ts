/**
 * Centralized date utilities
 */
export class DateService {
  /**
   * Get today's date as YYYY-MM-DD in LOCAL timezone (not UTC).
   * Critical: toISOString() returns UTC which can differ from local date for users east of UTC.
   */
  static getLocalDateString(date: Date = new Date()): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getStartOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // align to Monday
    return new Date(d.setDate(diff));
  }

  static getEndOfWeek(date: Date = new Date()): Date {
    const d = DateService.getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static getStartOfLastWeek(): Date {
    const d = DateService.getStartOfWeek();
    d.setDate(d.getDate() - 7);
    return d;
  }

  static getEndOfLastWeek(): Date {
    const d = DateService.getEndOfWeek();
    d.setDate(d.getDate() - 7);
    return d;
  }

  /**
   * Returns day name in lowercase (e.g. 'monday')
   */
  static getDayOfWeek(date: Date = new Date()): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }

  static isToday(dateString: string): boolean {
    return dateString === DateService.getLocalDateString();
  }

  static isRestDay(dayName: string, restDays: string[]): boolean {
    // This assumes restDays are strings like 'monday'.
    // If restDays are numbers (0-6), this needs adjustment or the caller needs to handle conversion.
    // Based on previous code, restDays in User profile are number[] (0=Sun, 6=Sat).
    // But caller might pass converted strings.
    // Let's implement based on what workoutGenerator expects or general utility.
    return restDays.includes(dayName.toLowerCase());
  }
}
