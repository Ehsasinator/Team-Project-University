import { Route } from '@angular/router';

import { AccessibilitySettingComponent } from './accessibility_setting.component';

export const ACCESSIBILITY_SETTING_ROUTE: Route = {
  path: '',
  component: AccessibilitySettingComponent,
  data: {
    pageTitle: 'ACCESSIBILITY_SETTING',
  },
};
