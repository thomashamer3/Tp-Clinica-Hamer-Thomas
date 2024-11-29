import { NgIf } from '@angular/common';
import { Component, Inject, Input, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DniPipe } from '../../pipes/dni.pipe';

@Component({
  selector: 'app-datos-perfil',
  standalone: true,
  imports: [NgIf, DniPipe],
  templateUrl: './datos-perfil.component.html',
  styleUrl: './datos-perfil.component.css',
})
export class DatosPerfilComponent {
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any = null) {
    if (this.data) {
      this.usuario.data = this.data.datos;
    }
  }

  @Input() usuario: any = {};
}
