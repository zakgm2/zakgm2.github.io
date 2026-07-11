import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  NgZone
} from '@angular/core';

@Directive({
  selector: '[appScrollStage]',
  standalone: false
})
export class ScrollStageDirective implements OnInit, OnDestroy {

  private ticking = false;
  private boundUpdate: () => void;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private zone: NgZone
  ) {
    this.boundUpdate = this.update.bind(this);
  }

  ngOnInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'scroll-stage');

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });

    this.update();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }

  private onScroll = () => {
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(this.boundUpdate);
    }
  };

  private update(): void {
    this.ticking = false;

    const el = this.el.nativeElement;

    // Reset transform before measuring — getBoundingClientRect includes the
    // element's current transform, so measuring without resetting first
    // would base this frame's calculation on last frame's shifted position,
    // compounding into runaway drift over successive scroll events.
    this.renderer.setStyle(el, 'transform', 'scale(1)');

    const rect = el.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const distance = elementCenter - viewportCenter;
    const range = window.innerHeight * 0.4;

    const rawProgress = Math.max(0, 1 - Math.abs(distance) / range);
    // steepen the falloff so neighboring stages don't stay visibly overlapped mid-transition
    const progress = Math.pow(rawProgress, 2.2);
    const shrink = 1 - progress;
    const scale = distance > 0 ? (1 - shrink * 0.25) : (1 + shrink * 0.3);

    this.renderer.setStyle(el, 'opacity', progress.toFixed(3));
    this.renderer.setStyle(el, 'transform', `scale(${scale.toFixed(3)})`);
    this.renderer.setStyle(el, 'pointer-events', progress > 0.5 ? 'auto' : 'none');
  }
}
