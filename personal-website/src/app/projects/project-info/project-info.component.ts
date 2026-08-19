import { Component, Input, OnInit, OnDestroy, AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  @Input() downloadWindowsUrl: string = "";
  @Input() downloadMacUrl: string = "";
  @Input() downloadStatsRepo: string = "";

  totalDownloads: string | null = null;

  routeDataSubscription: Subscription | null = null;
  translationSubscription: Subscription | null = null;

  // Scrolling is completely normal/native on this page — the arrow is just
  // a convenience shortcut, not the only way to move. atLastStage is
  // recalculated from the live scroll position (see onWindowScroll) rather
  // than tracked as owned state, since the user can scroll freely at any
  // time and that state would otherwise drift out of sync.
  atLastStage: boolean = false;

  constructor(private route: ActivatedRoute, private titleService: Title,private translateService: TranslateService, private cdr: ChangeDetectorRef) {

   }
  ngOnDestroy(): void {
    this.routeDataSubscription?.unsubscribe();
    this.translationSubscription?.unsubscribe();
    document.body.classList.remove('project-info-active');
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateAtLastStage());
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll(): void {
    this.updateAtLastStage();
  }

  private updateAtLastStage(): void {
    const sections = document.querySelectorAll('.stageSection');

    if (sections.length <= 1) {
      this.atLastStage = false;
      return;
    }

    const last = sections[sections.length - 1] as HTMLElement;
    const viewportCenter = window.innerHeight / 2;
    const lastCenter = this.documentOffsetTop(last) + last.offsetHeight / 2;
    const currentCenter = window.scrollY + viewportCenter;

    this.atLastStage = lastCenter <= currentCenter + 50;
  }

  get hasMultipleStages(): boolean {
    return this.flatFeatures.length > 1;
  }

  onArrowClick(): void {
    if (this.atLastStage) {
      window.scrollTo({top: 0, behavior: 'smooth'});
    } else {
      this.scrollToNext();
    }
  }

  private scrollToNext(): void {
    const sections = Array.from(document.querySelectorAll('.stageSection')) as HTMLElement[];
    const viewportCenter = window.innerHeight / 2;
    const currentCenter = window.scrollY + viewportCenter;

    for (const section of sections) {
      // offsetTop/offsetHeight reflect layout geometry only, unlike
      // getBoundingClientRect() which includes the live scale() transform
      // the scroll-reveal directive applies for its zoom effect.
      const sectionCenter = this.documentOffsetTop(section) + section.offsetHeight / 2;

      if (sectionCenter > currentCenter + 50) {
        window.scrollTo({top: sectionCenter - viewportCenter, behavior: 'smooth'});
        return;
      }
    }

    if (sections.length > 0) {
      const last = sections[sections.length - 1];
      const lastCenter = this.documentOffsetTop(last) + last.offsetHeight / 2;
      window.scrollTo({top: lastCenter - viewportCenter, behavior: 'smooth'});
    }
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

  private fetchDownloadCount(): void {
    fetch(`https://api.github.com/repos/${this.downloadStatsRepo}/releases?per_page=100`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((releases: {assets: {download_count: number}[]}[]) => {
        const total = releases.reduce(
          (sum, release) => sum + release.assets.reduce((s, a) => s + a.download_count, 0),
          0
        );
        this.totalDownloads = this.formatDownloadCount(total);
        // fetch() runs outside Angular's change-detection tracking, so the
        // view needs to be told explicitly that state changed here.
        this.cdr.markForCheck();
      })
      .catch(() => {
        // Rate-limited, offline, etc. — just don't show a count rather than
        // showing a broken/zero one.
        this.totalDownloads = null;
        this.cdr.markForCheck();
      });
  }

  private formatDownloadCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';

    if (n >= 1_000) {
      const kValue = (n / 1_000).toFixed(1);
      // toFixed rounding can push a value like 999,999 to "1000.0" — bump it
      // up to the M tier rather than displaying the nonsensical "1000.0K".
      if (kValue === '1000.0') return (n / 1_000_000).toFixed(1) + 'M';
      return kValue + 'K';
    }

    return n.toString();
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

        if (d["downloadStatsRepo"])
        {
          this.downloadStatsRepo = d["downloadStatsRepo"];
          this.fetchDownloadCount();
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
