import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Renderer2, NgZone, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-parallax',
    templateUrl: './parallax.component.html',
    styleUrls: ['./parallax.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ParallaxComponent implements OnInit, OnDestroy {

  @Input() bgImg = ''
  @Input() height = ''
  @Input() aspectRatio = ''

  @ViewChild('parallaxEl') parallaxEl!: ElementRef<HTMLDivElement>;

  private ticking = false;
  private boundUpdate: () => void;

  constructor(private renderer: Renderer2, private zone: NgZone) {
    this.boundUpdate = this.update.bind(this);
  }

  ngOnInit(): void {
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
  }

  private update(): void {
    this.ticking = false;

    const el = this.parallaxEl?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // progress: 0 when the box is just entering the bottom of the viewport,
    // 1 when it has fully exited the top — drives how far the background
    // has "panned" within the box, confined to the box's own crop overflow.
    const total = viewportHeight + rect.height;
    const traveled = viewportHeight - rect.top;
    const progress = Math.max(0, Math.min(1, traveled / total));

    const posY = 42 + progress * 16;
    this.renderer.setStyle(el, 'background-position', `center ${posY.toFixed(1)}%`);
  }
}
