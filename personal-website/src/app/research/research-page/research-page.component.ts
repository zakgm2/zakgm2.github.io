import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import TitleHelper from './../../../helpers/TitleHelper';
import { TranslateService } from '@ngx-translate/core';
import { LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-research-page',
    templateUrl: './research-page.component.html',
    styleUrls: ['./research-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ResearchPageComponent implements OnInit, OnDestroy {

  researchTitleSubscription: Subscription | null = null;

  constructor(private titleService: Title, private translateService: TranslateService) {

  }

  ngOnDestroy(): void {
    this.researchTitleSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.updateTranslationsOnPage();

    this.researchTitleSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) =>
    {
      this.updateTranslationsOnPage();
    })
  }

  updateTranslationsOnPage()
  {
    this.titleService.setTitle(TitleHelper.concat(this.translateService.instant('research.bannerText')))
  }
}
