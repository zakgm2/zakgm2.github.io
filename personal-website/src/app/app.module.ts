import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TriangularBannerComponent } from './shared/triangular-banner/triangular-banner.component';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ParallaxComponent } from './shared/parallax/parallax.component';
import { ListItemComponent } from './shared/list-item/list-item.component';
import { ListItemPairComponent } from './shared/list-item-pair/list-item-pair.component';
import { ProjectsPageComponent } from './projects/projects-page/projects-page.component';
import { ContactPageComponent } from './contact/contact-page/contact-page.component';
import { ResearchPageComponent } from './research/research-page/research-page.component';
import { PapersPageComponent } from './papers/papers-page/papers-page.component';
import { MainButtonComponent } from './shared/main-button/main-button.component';
import { ZoomCardLinkComponent } from './shared/zoom-card-link/zoom-card-link.component';
import { ProjectInfoComponent } from './projects/project-info/project-info.component';
import { MainButtonHrefComponent } from './shared/main-button-href/main-button-href.component';
import { ScrollRevealDirective } from './shared/scroll-reveal.directive';
import { ScrollStageDirective } from './shared/scroll-stage.directive';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient)
{
    return new TranslateHttpLoader(http)
}

@NgModule({ declarations: [
        AppComponent,
        NavbarComponent,
        FooterComponent,
        TriangularBannerComponent,
        HomepageComponent,
        ParallaxComponent,
        ListItemComponent,
        ListItemPairComponent,
        ProjectsPageComponent,
        ContactPageComponent,
        ResearchPageComponent,
        PapersPageComponent,
        MainButtonComponent,
        ZoomCardLinkComponent,
        ProjectInfoComponent,
        MainButtonHrefComponent,
        ScrollRevealDirective,
        ScrollStageDirective
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })], providers: [
        Title,
        provideHttpClient(withXhr(), withInterceptorsFromDi())
    ] })
export class AppModule { }
