import { ThisReceiver } from '@angular/compiler';
import { Component, Input, OnInit, OnDestroy, AfterViewInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
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
export class ProjectInfoComponent implements OnInit, OnDestroy, AfterViewInit {

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

  routeDataSubscription: Subscription | null = null;
  translationSubscription: Subscription | null = null;
  atLastStage: boolean = false;

  constructor(private route: ActivatedRoute, private titleService: Title,private translateService: TranslateService) {

   }
  ngOnDestroy(): void {
    this.routeDataSubscription?.unsubscribe();
    this.translationSubscription?.unsubscribe();
    document.body.classList.remove('project-info-active');
    document.body.classList.remove('js-scrolling');

    if (this.smoothScrollTimeoutId !== null) {
      clearTimeout(this.smoothScrollTimeoutId);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateArrowState());
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll(): void {
    this.updateArrowState();
  }

  private updateArrowState(): void {
    const sections = document.querySelectorAll('.stageSection');

    if (sections.length <= 1) {
      this.atLastStage = false;
      return;
    }

    const lastSection = sections[sections.length - 1] as HTMLElement;
    const rect = lastSection.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const center = rect.top + rect.height / 2;

    this.atLastStage = center <= viewportCenter + 50;
  }

  get hasMultipleStages(): boolean {
    return this.flatFeatures.length > 1;
  }

  onArrowClick(): void {
    if (this.atLastStage) {
      this.smoothScrollTo(0);
    } else {
      this.scrollToNext();
    }
  }

  private smoothScrollTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private smoothScrollTo(targetY: number): void {
    // Native scroll-snap can fight a JS-driven smooth scroll and pull the
    // page back to the previously snapped stage once it re-engages. The
    // 'scrollend' event is unreliable for this on iOS Safari (it can fire
    // early while combined with a scroll-snap-type change mid-animation,
    // re-enabling snap before the animation reaches its target and pulling
    // the page straight back to the stage it started from) so a fixed
    // timeout long enough to cover the animation is used instead.
    if (this.smoothScrollTimeoutId !== null) {
      clearTimeout(this.smoothScrollTimeoutId);
    }

    document.body.classList.add('js-scrolling');
    window.scrollTo({top: targetY, behavior: 'smooth'});

    this.smoothScrollTimeoutId = setTimeout(() => {
      document.body.classList.remove('js-scrolling');
      this.smoothScrollTimeoutId = null;
    }, 900);
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

  scrollToNext()
  {
    const sections = Array.from(document.querySelectorAll('.stageSection')) as HTMLElement[];
    const viewportCenter = window.innerHeight / 2;
    const currentCenter = window.scrollY + viewportCenter;

    for (const section of sections)
    {
      // offsetTop/offsetHeight reflect layout geometry only, unlike
      // getBoundingClientRect() which includes the live scale() transform
      // the scroll-reveal directive applies for the zoom effect. Using the
      // transformed rect here would compute a target that doesn't match
      // where CSS scroll-snap-align actually anchors, so the native snap
      // silently corrects to a different (often earlier) stage once it
      // re-engages after the animation.
      const sectionCenter = this.documentOffsetTop(section) + section.offsetHeight / 2;

      if (sectionCenter > currentCenter + 50)
      {
        this.smoothScrollTo(sectionCenter - viewportCenter);
        return;
      }
    }

    // Already at or past every section's center — snap to the last
    // section's own center rather than overshooting into unsnapped
    // territory, which mandatory scroll-snap would otherwise correct by
    // pulling back to an earlier stage once it re-engages.
    if (sections.length > 0)
    {
      const last = sections[sections.length - 1];
      const lastCenter = this.documentOffsetTop(last) + last.offsetHeight / 2;
      this.smoothScrollTo(lastCenter - viewportCenter);
    }
  }

  private documentOffsetTop(el: HTMLElement): number
  {
    let top = 0;
    let node: HTMLElement | null = el;

    while (node)
    {
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }

    return top;
  }
}
