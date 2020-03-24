import {Routes} from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { MlComponent } from './components/ml/ml.component';
import { GraphComponent } from './components/graph/graph.component';
import { DocsComponent } from './components/docs/docs.component';
import { GraphSecondExampleComponent } from './components/graph-second-example/graph-second-example.component';


export const ROUTES: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'search', component: SearchComponent},
    {path: 'graph', component: GraphComponent},
    {path: 'ml', component: MlComponent},
    {path: 'docs', component: DocsComponent},
    {path: 'example2', component: GraphSecondExampleComponent},
    {path: '', pathMatch: 'full', redirectTo: 'home'},
    {path: '**', pathMatch: 'full', redirectTo: 'home'}
];
