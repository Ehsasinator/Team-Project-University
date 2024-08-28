import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IEntry } from '../entry.model';
import { EntryService } from '../service/entry.service';

@Injectable({ providedIn: 'root' })
export class EntryRoutingResolveService implements Resolve<IEntry | null> {
  constructor(protected service: EntryService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IEntry | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((entry: HttpResponse<IEntry>) => {
          if (entry.body) {
            return of(entry.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(null);
  }
}
