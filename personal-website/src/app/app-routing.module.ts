import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ProjectsPageComponent } from './projects/projects-page/projects-page.component';
import { ContactPageComponent } from './contact/contact-page/contact-page.component';
import { ResearchPageComponent } from './research/research-page/research-page.component';
import { PapersPageComponent } from './papers/papers-page/papers-page.component';
import { ProjectInfoComponent } from './projects/project-info/project-info.component';
import ProjectInfoModel from '../models/ProjectInfoModel';

const routes: Routes = [
  {path: '', component: HomepageComponent},
  {path: 'projects', component: ProjectsPageComponent},
  {path: 'research', component: ResearchPageComponent},
  {path: 'papers', component: PapersPageComponent},
  {path: 'contact', component: ContactPageComponent},

  //PhysicsLibrary
  {path: "projects/physicslibrary", component: ProjectInfoComponent, data: new ProjectInfoModel(
    "../../../assets/img/projects/physicslibrary.webp", //Background image
    "projects.physicsLibrary",
    "https://github.com/zakgm2/PhysicsLibrary",
    ""
  )},

  //PhysicsAnalysisGUI
  {path: "projects/physicsanalysisgui", component: ProjectInfoComponent, data: new ProjectInfoModel(
    "../../../assets/img/projects/physicsanalysisgui.webp",
    "projects.physicsAnalysisGui",
    "https://github.com/zakgm2/PhysicsAnalysisGUI",
    ""
  )},

  //NeuroData-Interface
  {path: "projects/neurodata-interface", component: ProjectInfoComponent, data: new ProjectInfoModel(
    "../../../assets/img/projects/neurodata-interface.webp",
    "projects.neuroDataInterface",
    "https://github.com/zakgm2/NeuroData-Interface",
    ""
  )},

  //redirect old site
  {path: 'en', redirectTo: ""},
  {path: 'fr', redirectTo: ""},
  {path: 'en/contact', redirectTo: "contact"},
  {path: 'fr/contact', redirectTo: "contact"},
  {path: 'en/projects', redirectTo: "projects"},
  {path: 'fr/projects', redirectTo: "projects"},

  {path: '**', redirectTo: ""},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
