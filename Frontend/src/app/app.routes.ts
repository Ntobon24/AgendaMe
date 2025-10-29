import { Routes } from '@angular/router';
import { HomeComponent } from './features/pages/home/home';
import { LoginComponent } from './features/pages/login/login';
import { SignUpComponent } from './features/pages/sign-up/sign-up';
import { BusinessProfileComponent } from './features/pages/business-profile/business-profile';
import { UserProfileComponent } from './features/pages/user-profile/user-profile';
import { BusinessSearchComponent } from './features/pages/business-search/business-search';
import { AdminComponent } from './features/pages/admin/admin';
import { BusinessDetailsComponent } from './features/pages/business-details/business-details';
import { BusinessAppointmentsComponent } from './features/pages/business-appointments/business-appointments';
import { ClientAppointmentsComponent } from './features/pages/client-appointments/client-appointments';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    pathMatch: 'full'
  },
  {
    path: 'business-profile',
    component: BusinessProfileComponent,
    pathMatch: 'full'
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    pathMatch: 'full'
  },
  {
    path: 'business-search',
    component: BusinessSearchComponent,
    pathMatch: 'full'
  },
  {
    path: 'business/:id',
    component: BusinessDetailsComponent,
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminComponent,
    pathMatch: 'full'
  },
  {
    path: 'business-appointments',
    component: BusinessAppointmentsComponent,
    pathMatch: 'full'
  },
  {
    path: 'my-appointments',
    component: ClientAppointmentsComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
