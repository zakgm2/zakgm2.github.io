import { Component, OnInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import LocalStorageHelper from './../../../helpers/LocalStorageHelper';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NavbarComponent implements OnInit {

  currentLang: string | null = null;
  isVisible: boolean = true;

  private hoveringTop = false;

  constructor(public translate: TranslateService) {
    //@ts-ignore
    this.currentLang = LocalStorageHelper.getLang();
  }

  ngOnInit(): void {
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.recompute();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.hoveringTop = event.clientY <= 75;
    this.recompute();
  }

  private recompute(): void {
    const atTop = window.scrollY < 80;
    const visible = atTop || this.hoveringTop;
    if (this.isVisible !== visible)
    {
      this.isVisible = visible;
    }
  }

  setLanguage(lang: string)
  {
    this.translate.use(lang)
    this.currentLang = lang
    LocalStorageHelper.setLang(lang)
  }

  closeMobileMenu(): void
  {
    const menu = document.getElementById('toggleMobileMenu');
    if (!menu || !menu.classList.contains('show')) return;
    //@ts-ignore
    const bootstrap = (window as any).bootstrap;
    if (bootstrap)
    {
      const collapse = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
      collapse.hide();
    }
  }
}
