import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { CANVAS_ROUTE } from './canvas.route';
import { CanvasComponent } from './canvas.component';
import { ArtModule } from 'app/art/art.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(CANVAS_ROUTE), ArtModule],
  declarations: [CanvasComponent],
})
export class CanvasModule {}
