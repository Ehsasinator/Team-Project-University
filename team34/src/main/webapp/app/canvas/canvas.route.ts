import { Routes } from '@angular/router';

import { CanvasComponent } from './canvas.component';

export const CANVAS_ROUTE: Routes = [
  {
    path: '',
    component: CanvasComponent,
    data: {
      pageTitle: 'Canvas',
    },
  },
];
