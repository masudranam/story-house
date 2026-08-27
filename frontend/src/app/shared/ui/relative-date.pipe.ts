import { Pipe, PipeTransform } from '@angular/core';

/** "3 days ago" style formatting for ISO-8601 timestamps from the API. */
@Pipe({ name: 'relativeDate' })
export class RelativeDatePipe implements PipeTransform {
  private static readonly UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
  ];

  transform(isoDate: string): string {
    const elapsed = Date.now() - new Date(isoDate).getTime();
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    for (const [unit, ms] of RelativeDatePipe.UNITS) {
      if (Math.abs(elapsed) >= ms) {
        return formatter.format(-Math.round(elapsed / ms), unit);
      }
    }
    return 'just now';
  }
}
