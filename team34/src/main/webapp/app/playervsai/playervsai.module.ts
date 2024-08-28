import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlayerVsAIComponent } from './playervsai.component';
import { PLAYERVSAI_ROUTE } from './playervsai.route';

@NgModule({
  declarations: [PlayerVsAIComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild([PLAYERVSAI_ROUTE])],
  exports: [PlayerVsAIComponent],
})
export class PlayerVsAIModule {}
