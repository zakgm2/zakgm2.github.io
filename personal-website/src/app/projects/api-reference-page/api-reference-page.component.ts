import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import TitleHelper from '../../../helpers/TitleHelper';

@Component({
    selector: 'app-api-reference-page',
    templateUrl: './api-reference-page.component.html',
    styleUrls: ['./api-reference-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    // Emulated encapsulation (the default) scopes CSS via an attribute
    // Angular only adds to elements it compiles from the template — raw
    // HTML injected via [innerHTML] (the whole rendered markdown body
    // here) never gets that attribute, so scoped rules would silently
    // never match it. The .markdownContent/.apiReferenceContainer/
    // .backLink prefixes below are specific enough that going unscoped
    // is safe.
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ApiReferencePageComponent implements OnInit {

  content: SafeHtml = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private titleService: Title, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.titleService.setTitle(TitleHelper.concat('PhysicsLibrary API Reference'));

    // Pre-rendered at build time from PhysicsLibrary's own API_REFERENCE.md
    // (see src/assets/docs) rather than parsing markdown client-side, to
    // avoid adding a markdown-rendering dependency to the app bundle for
    // what is otherwise a single static page.
    this.http.get('assets/docs/physicslibrary-api-reference.html', { responseType: 'text' })
      .subscribe(html => {
        this.content = this.sanitizer.bypassSecurityTrustHtml(html);
        // The HTTP response arrives outside Angular's change-detection
        // tracking in this app's zoneless setup, so the view needs to be
        // told explicitly that state changed here (same issue hit with
        // the GitHub download count on the project-info page).
        this.cdr.markForCheck();
      });
  }
}
