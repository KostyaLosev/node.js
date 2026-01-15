import { Routes } from '@angular/router';
import { ArticlesList } from './components/article-list/article-list';
import { ArticleCreate } from './components/article-create/article-create';
import { ArticleView } from './components/article-view/article-view';

export const routes: Routes = [
  { path: '', component: ArticlesList},
  {path: 'article/:id', component: ArticleView },
  {path: 'create', component: ArticleCreate },
  { path: '**', redirectTo: '' }
];
