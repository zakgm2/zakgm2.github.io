import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import TitleHelper from '../../../helpers/TitleHelper';

@Component({
    selector: 'app-project-info',
    templateUrl: './project-info.component.html',
    styleUrls: ['./project-info.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ProjectInfoComponent implements OnInit, OnDestroy {

  @Input() backgroundImageSource: string = "";
  @Input() header: string = "Header text";
  @Input() description: string = "description text";
  @Input() features: string[] = [];
  @Input() featureGroups: {header: string, summary: string}[] = [];
  flatFeatures: {title: string, description: string}[] = [];
  @Input() btnText: string = "button text";
  @Input() btnHref: string = "";
  @Input() btnRouterLink: string = "";
  @Input() translationKey: string="";
  @Input() downloadWindowsUrl: string = "";
  @Input() downloadMacUrl: string = "";

  routeDataSubscription: Subscription | null = null;
  translationSubscription: Subscription | null = null;

  // -1 = intro/hero, 0..N-1 = a stage. Native scroll/swipe input is blocked
  // on multi-stage pages (see onWheel/onTouchEnd) so this index is always
  // the single source of truth for where we are — we never need to infer
  // position from live scroll math, which is what made the old
  // scroll-driven implementation fragile on iOS Safari.
  currentStageIndex: number = -1;
  private isAnimating: boolean = false;
  private animFrameId: number | null = null;
  private animSafetyTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private touchStartY: number = 0;

  constructor(private route: ActivatedRoute, private titleService: Title,private translateService: TranslateService) {

   }
  ngOnDestroy(): void {
    this.routeDataSubscription?.unsubscribe();
    this.translationSubscription?.unsubscribe();
    document.body.classList.remove('project-info-active');

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    if (this.animSafetyTimeoutId !== null) {
      clearTimeout(this.animSafetyTimeoutId);
    }
  }

  get hasMultipleStages(): boolean {
    return this.flatFeatures.length > 1;
  }

  get atLastStage(): boolean {
    return this.currentStageIndex === this.flatFeatures.length - 1;
  }

  onArrowClick(): void {
    if (this.atLastStage) {
      this.goToStage(-1);
    } else {
      this.goToStage(this.currentStageIndex + 1);
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.hasMultipleStages) return;
    event.preventDefault();

    if (this.isAnimating) return;

    if (event.deltaY > 0) {
      this.onArrowClick();
    } else if (event.deltaY < 0) {
      this.goToStage(this.currentStageIndex - 1);
    }
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.hasMultipleStages) return;
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.hasMultipleStages) return;
    event.preventDefault();
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.hasMultipleStages) return;
    if (this.isAnimating) return;

    const deltaY = this.touchStartY - event.changedTouches[0].clientY;
    const swipeThreshold = 30;

    if (Math.abs(deltaY) < swipeThreshold) return;

    if (deltaY > 0) {
      this.onArrowClick();
    } else {
      this.goToStage(this.currentStageIndex - 1);
    }
  }

  private goToStage(index: number): void {
    const clamped = Math.max(-1, Math.min(index, this.flatFeatures.length - 1));
    if (clamped === this.currentStageIndex) return;

    // Compute the target BEFORE touching any state. If this throws (e.g. the
    // DOM section lookup momentarily fails), isAnimating never gets set and
    // can't get stuck locked — a previous version set isAnimating = true
    // before this call, and an exception here would skip the setTimeout
    // that resets it, permanently blocking all future wheel/touch input.
    const targetY = this.computeTargetYForIndex(clamped);
    if (targetY === null) return;

    this.currentStageIndex = clamped;
    this.isAnimating = true;

    window.scrollTo({top: targetY, behavior: 'smooth'});
    this.watchForScrollSettle();
  }

  // A fixed timeout for "animation done" is a guess that doesn't match how
  // long a real device's smooth-scroll actually takes (varies with distance
  // and device speed) — guess too short and a new gesture can fire mid
  // animation, racing with it. Instead, poll scrollY each frame and only
  // release the lock once it's stopped moving for a few consecutive frames.
  private watchForScrollSettle(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.animSafetyTimeoutId !== null) {
      clearTimeout(this.animSafetyTimeoutId);
    }

    let lastY = window.scrollY;
    let stableFrames = 0;

    const check = () => {
      const y = window.scrollY;

      if (Math.abs(y - lastY) < 0.5) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }

      lastY = y;

      if (stableFrames >= 4) {
        this.finishAnimating();
        return;
      }

      this.animFrameId = requestAnimationFrame(check);
    };

    this.animFrameId = requestAnimationFrame(check);

    // Safety net in case something prevents the settle check from ever
    // resolving (should not happen, but must never leave input locked out).
    this.animSafetyTimeoutId = setTimeout(() => this.finishAnimating(), 2500);
  }

  private finishAnimating(): void {
    this.isAnimating = false;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.animSafetyTimeoutId !== null) {
      clearTimeout(this.animSafetyTimeoutId);
      this.animSafetyTimeoutId = null;
    }
  }

  private computeTargetYForIndex(index: number): number | null {
    if (index < 0) return 0;

    const sections = document.querySelectorAll('.stageSection');
    const section = sections[index] as HTMLElement | undefined;
    if (!section) return null;

    const viewportCenter = window.innerHeight / 2;

    return this.documentOffsetTop(section) + section.offsetHeight / 2 - viewportCenter;
  }

  private documentOffsetTop(el: HTMLElement): number {
    let top = 0;
    let node: HTMLElement | null = el;

    while (node) {
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }

    return top;
  }

  ngOnInit(): void {
    document.body.classList.add('project-info-active');

    this.routeDataSubscription = this.route.data.subscribe(d =>
      {
        if (d["backgroundImageSource"])
        {
          this.backgroundImageSource = d["backgroundImageSource"];
        }

        if (d["btnHref"])
        {
          this.btnHref = d["btnHref"];
        }

        if (d["btnRouterLink"])
        {
          this.btnRouterLink = d["btnRouterLink"];
        }

        if (d["translationKey"])
        {
          this.translationKey = d["translationKey"];
        }

        if (d["downloadWindowsUrl"])
        {
          this.downloadWindowsUrl = d["downloadWindowsUrl"];
        }

        if (d["downloadMacUrl"])
        {
          this.downloadMacUrl = d["downloadMacUrl"];
        }
      })

      this.updateTranslationsOnPage();

      this.translationSubscription = this.translateService.onLangChange.subscribe( (event: LangChangeEvent) =>
      {
        this.updateTranslationsOnPage();
      } )
  }

  updateTranslationsOnPage()
  {
    let translationData = this.translateService.instant(this.translationKey);

    this.header = translationData["infoPageHeader"];
    this.description = translationData["infoPageDescription"];
    this.btnText = translationData["infoPageButtonText"];
    this.features = translationData["infoPageFeatures"] || [];
    this.featureGroups = translationData["infoPageFeatureGroups"] || [];

    this.flatFeatures = [
      ...this.features.map(item => ({title: item, description: ''})),
      ...this.featureGroups.map(group => ({title: group.header, description: group.summary}))
    ];

    this.titleService.setTitle(TitleHelper.concat(this.header))
  }
}
