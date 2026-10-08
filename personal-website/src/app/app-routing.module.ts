import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ProjectsPageComponent } from './projects/projects-page/projects-page.component';
import { ContactPageComponent } from './contact/contact-page/contact-page.component';
import { ResearchPageComponent } from './research/research-page/research-page.component';
import { PapersPageComponent } from './papers/papers-page/papers-page.component';
import { ProjectInfoComponent } from './projects/project-info/project-info.component';
import { ApiReferencePageComponent } from './projects/api-reference-page/api-reference-page.component';
import ProjectInfoModel from '../models/ProjectInfoModel';

const routes: Routes = [
  {path: '', component: HomepageComponent},
  {path: 'projects', component: ProjectsPageComponent},
  {path: 'research', component: ResearchPageComponent},
  {path: 'papers', component: PapersPageComponent},
  {path: 'contact', component: ContactPageComponent},

  //PyAT CLI (PhysicsLibrary repo)
  {path: "projects/pyatcli", component: ProjectInfoComponent, data: new ProjectInfoModel(
    "../../../assets/img/projects/PyATCLI.webp", //Background image
    "projects.physicsLibrary",
    "https://github.com/zakgm2/PhysicsLibrary",
    "",
    "",
    "",
    "",
    "/projects/pyatcli/docs",
    "contain"
  )},

  //PyAT CLI (PhysicsLibrary repo) API Reference
  {path: "projects/pyatcli/docs", component: ApiReferencePageComponent},

  //PhysicsAnalysisGUI
  {path: "projects/pyat", component: ProjectInfoComponent, data: new ProjectInfoModel(
    "../../../assets/img/projects/PyATGUI.webp",
    "projects.physicsAnalysisGui",
    "https://github.com/zakgm2/PhysicsAnalysisGUI",
    "",
    "https://github.com/zakgm2/PhysicsAnalysis/releases/latest/download/PyAT-windows.zip",
    "https://github.com/zakgm2/PhysicsAnalysis/releases/latest/download/PyAT-macos.zip",
    "zakgm2/PhysicsAnalysisGUI",
    "",
    // The logo is a square; "cover" would zoom it to fill a wide viewport.
    "contain",
    "https://github.com/zakgm2/PhysicsAnalysisGUI/issues"
  )},

  //Old PhysicsLibrary URLs
  {path: "projects/physicslibrary", redirectTo: "projects/pyatcli"},
  {path: "projects/physicslibrary/docs", redirectTo: "projects/pyatcli/docs"},

  //Old URL for the Python Analysis Tool page
  {path: "projects/physicsanalysisgui", redirectTo: "projects/pyat"},

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
