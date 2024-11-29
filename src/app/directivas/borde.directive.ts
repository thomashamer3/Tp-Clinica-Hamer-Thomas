import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBorde]',
  standalone: true,
})
export class BordeDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseover') onMouseOver() {
    this.setBorder('4px solid green');
  }

  @HostListener('mouseout') onMouseOut() {
    this.setBorder('');
  }

  private setBorder(value: string) {
    this.renderer.setStyle(this.el.nativeElement, 'border', value);
  }
}
