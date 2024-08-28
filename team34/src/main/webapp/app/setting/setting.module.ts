import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { SETTING_ROUTE } from './setting.route';
import { SettingComponent } from './setting.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([SETTING_ROUTE])],
  declarations: [SettingComponent],
})
export class SettingModule {}
