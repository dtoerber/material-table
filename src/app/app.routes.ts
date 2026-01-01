import { Routes } from '@angular/router';
import { Tree15Component } from './components/tree-15/tree-15';
import { TreeComponent } from './components/tree/tree.component';

export const routes: Routes = [
  { path: 'tree', component: TreeComponent },
  { path: 'tree15', component: Tree15Component },
  { path: '', redirectTo: 'tree', pathMatch: 'full' },
];
