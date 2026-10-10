import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import TitleHelper from '../../../helpers/TitleHelper';

// Where this page lives. The site is served from <base href="/">, so a bare href="#section" in the injected
// HTML would mean "section on the home page"; every in-page link is rewritten to start with this instead.
const DOCS_PATH = '/projects/pyatcli/docs';

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

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private titleService: Title, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.titleService.setTitle(TitleHelper.concat('PyATCLI API Reference'));

    // The address can also change while the page is open (a pasted link, a link from another page): the router
    // scrolls to the top after every navigation, so wait for that and then go to the heading.
    this.route.fragment.subscribe(fragment => setTimeout(() => this.scrollToFragment(fragment, false), 100));

    // Pre-rendered from PyATCLI's own API_REFERENCE.md
    // (see src/assets/docs) rather than parsing markdown client-side, to
    // avoid adding a markdown-rendering dependency to the app bundle for
    // what is otherwise a single static page.
    this.http.get('assets/docs/pyatcli-api-reference.html', { responseType: 'text' })
      .subscribe(html => {
        this.content = this.sanitizer.bypassSecurityTrustHtml(this.prepare(html));
        // The HTTP response arrives outside Angular's change-detection
        // tracking in this app's zoneless setup, so the view needs to be
        // told explicitly that state changed here (same issue hit with
        // the GitHub download count on the project-info page).
        this.cdr.markForCheck();
        // A link such as /projects/pyatcli/docs#group-analysis: the headings only exist once the HTML is on the page.
        this.scrollToFragment(this.route.snapshot.fragment, false);
      });
  }

  // In-page links ("#loading-data") point at this page's own address, so opening one in a new tab or copying it works too;
  // links out of the page open in a new tab.
  private prepare(html: string): string {
    return html
      .replace(/href="#/g, `href="${DOCS_PATH}#`)
      .replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener noreferrer" href="$1');
  }

  // A plain click on an in-page link scrolls to the heading instead of loading a page.
  onContentClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    const href = (event.target as Element | null)?.closest('a')?.getAttribute('href') ?? '';
    if (!href.startsWith(DOCS_PATH + '#')) {
      return;
    }
    event.preventDefault();
    // Keeps the address bar shareable without asking the router to navigate (which would scroll to the top).
    history.replaceState(history.state, '', href);
    this.scrollToFragment(decodeURIComponent(href.slice(DOCS_PATH.length + 1)), true);
  }

  private scrollToFragment(id: string | null, smooth: boolean, triesLeft: number = 20): void {
    if (!id) {
      return;
    }
    const heading = document.getElementById(id);
    if (heading) {
      heading.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    } else if (triesLeft > 0) {
      setTimeout(() => this.scrollToFragment(id, smooth, triesLeft - 1), 50);
    }
  }
}
