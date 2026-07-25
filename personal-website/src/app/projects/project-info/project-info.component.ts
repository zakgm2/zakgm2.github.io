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
      window.scrollTo({top: 0, behavior: 'smooth'});
    } else {
      this.scrollToNext();
    }
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

    for (const section of sections)
    {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;

      if (center > viewportCenter + 50)
      {
        const targetY = window.scrollY + (center - viewportCenter);
        window.scrollTo({top: targetY, behavior: 'smooth'});
        return;
      }
    }

    window.scrollBy({top: window.innerHeight, behavior: 'smooth'});
  }
}
