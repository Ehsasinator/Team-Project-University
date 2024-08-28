import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILeaderboard, NewLeaderboard } from '../leaderboard.model';

export type PartialUpdateLeaderboard = Partial<ILeaderboard> & Pick<ILeaderboard, 'id'>;

export type EntityResponseType = HttpResponse<ILeaderboard>;
export type EntityArrayResponseType = HttpResponse<ILeaderboard[]>;

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/leaderboards');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(leaderboard: NewLeaderboard): Observable<EntityResponseType> {
    return this.http.post<ILeaderboard>(this.resourceUrl, leaderboard, { observe: 'response' });
  }

  update(leaderboard: ILeaderboard): Observable<EntityResponseType> {
    return this.http.put<ILeaderboard>(`${this.resourceUrl}/${this.getLeaderboardIdentifier(leaderboard)}`, leaderboard, {
      observe: 'response',
    });
  }

  partialUpdate(leaderboard: PartialUpdateLeaderboard): Observable<EntityResponseType> {
    return this.http.patch<ILeaderboard>(`${this.resourceUrl}/${this.getLeaderboardIdentifier(leaderboard)}`, leaderboard, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILeaderboard>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILeaderboard[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLeaderboardIdentifier(leaderboard: Pick<ILeaderboard, 'id'>): number {
    return leaderboard.id;
  }

  compareLeaderboard(o1: Pick<ILeaderboard, 'id'> | null, o2: Pick<ILeaderboard, 'id'> | null): boolean {
    return o1 && o2 ? this.getLeaderboardIdentifier(o1) === this.getLeaderboardIdentifier(o2) : o1 === o2;
  }

  addLeaderboardToCollectionIfMissing<Type extends Pick<ILeaderboard, 'id'>>(
    leaderboardCollection: Type[],
    ...leaderboardsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const leaderboards: Type[] = leaderboardsToCheck.filter(isPresent);
    if (leaderboards.length > 0) {
      const leaderboardCollectionIdentifiers = leaderboardCollection.map(
        leaderboardItem => this.getLeaderboardIdentifier(leaderboardItem)!
      );
      const leaderboardsToAdd = leaderboards.filter(leaderboardItem => {
        const leaderboardIdentifier = this.getLeaderboardIdentifier(leaderboardItem);
        if (leaderboardCollectionIdentifiers.includes(leaderboardIdentifier)) {
          return false;
        }
        leaderboardCollectionIdentifiers.push(leaderboardIdentifier);
        return true;
      });
      return [...leaderboardsToAdd, ...leaderboardCollection];
    }
    return leaderboardCollection;
  }

  search(parameter: string): Observable<EntityArrayResponseType> {
    return this.http.get<ILeaderboard[]>(`${this.resourceUrl}/search`, {
      params: { searchParameter: parameter },
      observe: 'response',
    });
  }
}
