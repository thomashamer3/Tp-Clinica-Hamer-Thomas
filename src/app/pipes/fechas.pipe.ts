import { Pipe, PipeTransform, LOCALE_ID } from '@angular/core';
import { formatDate, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

@Pipe({
  name: 'fecha',
  standalone: true
})
export class FechasPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    const fecha = new Date(value);

    return formatDate(fecha, 'yyyy-MM-dd', 'es');
  }

}