import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'doctor',
  standalone: true
})
export class DoctorPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return "Dr."+value;
  }

}