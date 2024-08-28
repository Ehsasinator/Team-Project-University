import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { ArtComponent } from './art.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ArtComponent],
  exports: [ArtComponent],
})
export class ArtModule {}
