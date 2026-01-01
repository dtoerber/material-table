import { Routes } from '@angular/router';
import { TreeComponent } from './components/tree/tree.component';
import { TreeTwoComponent } from './components/tree-two/tree-two';

export const routes: Routes = [
  { path: 'tree', component: TreeComponent },
  { path: 'tree2', component: TreeTwoComponent },
  { path: '', redirectTo: 'tree', pathMatch: 'full' },
];
