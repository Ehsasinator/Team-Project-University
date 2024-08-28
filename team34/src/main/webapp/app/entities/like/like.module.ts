import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { LikeComponent } from './list/like.component';
import { LikeDetailComponent } from './detail/like-detail.component';
import { LikeUpdateComponent } from './update/like-update.component';
import { LikeDeleteDialogComponent } from './delete/like-delete-dialog.component';
import { LikeRoutingModule } from './route/like-routing.module';

@NgModule({
  imports: [SharedModule, LikeRoutingModule],
  declarations: [LikeComponent, LikeDetailComponent, LikeUpdateComponent, LikeDeleteDialogComponent],
})
export class LikeModule {}
