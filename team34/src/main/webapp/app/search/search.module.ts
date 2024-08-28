import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { SEARCH_ROUTE } from './search.route';
import { SearchComponent } from './search.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([SEARCH_ROUTE])],
  declarations: [SearchComponent],
})
export class SearchModule {}
