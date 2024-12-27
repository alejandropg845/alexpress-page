import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  {
    path: 'alexpress',
    loadChildren: () => import('./pages/pages.module')
    .then(m => m.PagesModule)
  },
  {
    path: 'auth',
    canActivate: [authGuard],
    loadChildren: () => import('./auth/auth.module')
    .then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: 'alexpress'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  })]
})
export class AppRoutingModule { }
