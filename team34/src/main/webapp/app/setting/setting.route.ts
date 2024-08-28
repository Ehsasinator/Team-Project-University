import { Route } from '@angular/router';

import { SettingComponent } from './setting.component';

export const SETTING_ROUTE: Route = {
  path: '',
  component: SettingComponent,
  data: {
    pageTitle: 'SETTING',
  },
};
