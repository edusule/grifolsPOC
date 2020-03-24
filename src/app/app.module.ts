import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { VerticalComponent } from './components/vertical/vertical.component';
import { FontAwesomeModule, FaIconLibrary  } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { ROUTES } from './app.routes';
import { RouterModule } from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import { MlComponent } from './components/ml/ml.component';
import { GraphComponent } from './components/graph/graph.component';
import { DocsComponent } from './components/docs/docs.component';
import { GraphSecondExampleComponent } from './components/graph-second-example/graph-second-example.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VerticalComponent,
    HomeComponent,
    SearchComponent,
    MlComponent,
    GraphComponent,
    DocsComponent,
    GraphSecondExampleComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot( ROUTES, {useHash : true}),
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas, far);
  }
}
