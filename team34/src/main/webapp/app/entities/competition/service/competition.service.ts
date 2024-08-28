import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ICompetition, NewCompetition } from '../competition.model';

export type PartialUpdateCompetition = Partial<ICompetition> & Pick<ICompetition, 'id'>;

type RestOf<T extends ICompetition | NewCompetition> = Omit<T, 'dueDate'> & {
  dueDate?: string | null;
};

export type RestCompetition = RestOf<ICompetition>;

export type NewRestCompetition = RestOf<NewCompetition>;

export type PartialUpdateRestCompetition = RestOf<PartialUpdateCompetition>;

export type EntityResponseType = HttpResponse<ICompetition>;
export type EntityArrayResponseType = HttpResponse<ICompetition[]>;

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/competitions');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(competition: NewCompetition): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(competition);
    return this.http
      .post<RestCompetition>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(competition: ICompetition): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(competition);
    return this.http
      .put<RestCompetition>(`${this.resourceUrl}/${this.getCompetitionIdentifier(competition)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(competition: PartialUpdateCompetition): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(competition);
    return this.http
      .patch<RestCompetition>(`${this.resourceUrl}/${this.getCompetitionIdentifier(competition)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestCompetition>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCompetition[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getCompetitionIdentifier(competition: Pick<ICompetition, 'id'>): number {
    return competition.id;
  }

  compareCompetition(o1: Pick<ICompetition, 'id'> | null, o2: Pick<ICompetition, 'id'> | null): boolean {
    return o1 && o2 ? this.getCompetitionIdentifier(o1) === this.getCompetitionIdentifier(o2) : o1 === o2;
  }

  addCompetitionToCollectionIfMissing<Type extends Pick<ICompetition, 'id'>>(
    competitionCollection: Type[],
    ...competitionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const competitions: Type[] = competitionsToCheck.filter(isPresent);
    if (competitions.length > 0) {
      const competitionCollectionIdentifiers = competitionCollection.map(
        competitionItem => this.getCompetitionIdentifier(competitionItem)!
      );
      const competitionsToAdd = competitions.filter(competitionItem => {
        const competitionIdentifier = this.getCompetitionIdentifier(competitionItem);
        if (competitionCollectionIdentifiers.includes(competitionIdentifier)) {
          return false;
        }
        competitionCollectionIdentifiers.push(competitionIdentifier);
        return true;
      });
      return [...competitionsToAdd, ...competitionCollection];
    }
    return competitionCollection;
  }

  protected convertDateFromClient<T extends ICompetition | NewCompetition | PartialUpdateCompetition>(competition: T): RestOf<T> {
    return {
      ...competition,
      dueDate: competition.dueDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restCompetition: RestCompetition): ICompetition {
    return {
      ...restCompetition,
      dueDate: restCompetition.dueDate ? dayjs(restCompetition.dueDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestCompetition>): HttpResponse<ICompetition> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCompetition[]>): HttpResponse<ICompetition[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }

  getRandomWord(): Observable<string> {
    return this.http.get(`${this.resourceUrl}/randomWord`, { responseType: 'text' });
  }
}
