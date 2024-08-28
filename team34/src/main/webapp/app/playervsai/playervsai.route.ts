import { Route } from '@angular/router';
import { PlayerVsAIComponent } from './playervsai.component';

export const PLAYERVSAI_ROUTE: Route = {
  path: 'playervsai',
  component: PlayerVsAIComponent,
  data: {
    pageTitle: 'Player Vs AI',
  },
};
