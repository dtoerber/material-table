import { Routes } from '@angular/router';
import { TreeComponent } from './components/tree/tree.component';

export const routes: Routes = [
  { path: 'tree', component: TreeComponent },
  { path: '', redirectTo: 'tree', pathMatch: 'full' },
];
