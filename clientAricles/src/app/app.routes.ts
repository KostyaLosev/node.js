import { Routes } from '@angular/router';
import { ArticlesList } from './components/article-list/article-list';
import { ArticleCreate } from './components/article-create/article-create';
import { ArticleView } from './components/article-view/article-view';
import { ArticleEdit } from './components/article-edit/article-edit';
import { AuthLoginComponent } from './components/auth-login/auth-login';
import { AuthRegisterComponent } from './components/auth-register/auth-register';
import { HomeComponent } from './components/home/home';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: 'login', component: AuthLoginComponent },
  { path: 'register', component: AuthRegisterComponent },
  { path: 'logic', component: ArticlesList, canActivate: [authGuard] },
  { path: 'article/:id', component: ArticleView, canActivate: [authGuard] },
  { path: 'create', component: ArticleCreate, canActivate: [authGuard] },
  { path: 'article/:id/edit', component: ArticleEdit, canActivate: [authGuard] },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
