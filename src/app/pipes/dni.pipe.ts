import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dni',
  standalone: true
})
export class DniPipe implements PipeTransform {

    transform(value: number | string): string {
        let dni = value.toString();
        // Eliminar cualquier caracter que no sea dígito
        dni = dni.replace(/\D/g, '');

        // Formatear el DNI con puntos
        return dni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

}