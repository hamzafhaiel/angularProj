import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ConferenceList } from './conference-list/conference-list';
import { Notfound } from './notfound/notfound';

export const routes: Routes = [
    {path:'home',component:Home},
    {path:'list',component:ConferenceList},
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'**',component:Notfound},

];
