import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import LocalStorageHelper from './../helpers/LocalStorageHelper';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent implements OnInit{
  title = 'personal-website';

  // The footer is hidden on individual project detail pages
  // (/projects/xyz) since those already use their own full-viewport
  // background/scroll layout — it stays on every other page, including
  // the /projects listing itself.
  showFooter = true;

  constructor(private router: Router, public translate: TranslateService, private cdr: ChangeDetectorRef)
  {
      translate.addLangs(['en', 'fr']);

      if (LocalStorageHelper.getLang())
      {
        //@ts-ignore
        translate.use(LocalStorageHelper.getLang())
      }
      else
      {
        //@ts-ignore
        translate.use("en");
      }

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd)
        {
          this.showFooter = !event.urlAfterRedirects.startsWith('/projects/');
          this.cdr.markForCheck();
        }
      });
   }

  ngOnInit()
  {

  }

}
