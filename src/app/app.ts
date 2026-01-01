import { Component } from '@angular/core';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  imports: [NavComponent],
  template: `<app-nav></app-nav>`,
})
export class App {}
