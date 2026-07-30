import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import TitleHelper from './../../../helpers/TitleHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-papers-page',
    templateUrl: './papers-page.component.html',
    styleUrls: ['./papers-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PapersPageComponent implements OnInit, OnDestroy {

  papersTitleSubscription: Subscription | null = null;

  items = [
    {
      titleKey: 'papers.fiberPhotometryLitReview.title',
      descriptionKey: 'papers.fiberPhotometryLitReview.description',
      href: 'assets/papers/fibre-photometry-literature-review.pdf'
    },
    {
      titleKey: 'papers.efnmrMri.title',
      descriptionKey: 'papers.efnmrMri.description',
      href: 'assets/papers/efnmr-mri-lab-report.pdf'
    },
    {
      titleKey: 'papers.nirsMuscle.title',
      descriptionKey: 'papers.nirsMuscle.description',
      href: 'assets/papers/nirs-muscle-oxygen-lab-report.pdf'
    }
  ];

  constructor(private titleService: Title, private translateService: TranslateService) {

  }

  ngOnDestroy(): void {
    this.papersTitleSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.updateTranslationsOnPage();

    this.papersTitleSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) =>
    {
      this.updateTranslationsOnPage();
    })
  }

  updateTranslationsOnPage()
  {
    this.titleService.setTitle(TitleHelper.concat(this.translateService.instant('papers.bannerText')))
  }
}
