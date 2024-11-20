import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMenu]',
  standalone: true,
})
export class MenuDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseover') onMouseOver() {
    this.setBackground('lightgray');
    this.setCursor('pointer');
  }

  @HostListener('mouseout') onMouseOut() {
    this.setBackground('');
    this.setCursor('');
  }

  private setBackground(value: string) {
    this.renderer.setStyle(this.el.nativeElement, 'background', value);
  }

  private setCursor(value: string) {
    this.renderer.setStyle(this.el.nativeElement, 'cursor', value);
  }
}
