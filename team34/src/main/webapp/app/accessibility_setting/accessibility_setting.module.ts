import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { ACCESSIBILITY_SETTING_ROUTE } from './accessibility_setting.route';
import { AccessibilitySettingComponent } from './accessibility_setting.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([ACCESSIBILITY_SETTING_ROUTE])],
  declarations: [AccessibilitySettingComponent],
})
export class AccessibilitySettingModule {}
