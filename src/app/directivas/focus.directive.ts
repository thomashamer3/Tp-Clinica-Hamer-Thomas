import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFocus]',
  standalone: true
})
export class FocusDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('focus') onFocus() {
    this.setBorder('2px solid blue');
  }

  @HostListener('blur') onBlur() {
    this.setBorder('');
  }

  private setBorder(value: string) {
    this.renderer.setStyle(this.el.nativeElement, 'border', value);
  }

}
