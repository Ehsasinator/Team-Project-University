import { Route } from '@angular/router';

import { SearchComponent } from './search.component';

export const SEARCH_ROUTE: Route = {
  path: '',
  component: SearchComponent,
  data: {
    pageTitle: 'Search',
  },
};
