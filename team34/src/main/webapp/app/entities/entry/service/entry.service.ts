import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEntry, NewEntry } from '../entry.model';

export type PartialUpdateEntry = Partial<IEntry> & Pick<IEntry, 'id'>;

type RestOf<T extends IEntry | NewEntry> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestEntry = RestOf<IEntry>;

export type NewRestEntry = RestOf<NewEntry>;

export type PartialUpdateRestEntry = RestOf<PartialUpdateEntry>;

export type EntityResponseType = HttpResponse<IEntry>;
export type EntityArrayResponseType = HttpResponse<IEntry[]>;

@Injectable({ providedIn: 'root' })
export class EntryService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/entries');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(entry: NewEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(entry);
    return this.http.post<RestEntry>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(entry: IEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(entry);
    return this.http
      .put<RestEntry>(`${this.resourceUrl}/${this.getEntryIdentifier(entry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(entry: PartialUpdateEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(entry);
    return this.http
      .patch<RestEntry>(`${this.resourceUrl}/${this.getEntryIdentifier(entry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestEntry>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestEntry[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getEntryIdentifier(entry: Pick<IEntry, 'id'>): number {
    return entry.id;
  }

  compareEntry(o1: Pick<IEntry, 'id'> | null, o2: Pick<IEntry, 'id'> | null): boolean {
    return o1 && o2 ? this.getEntryIdentifier(o1) === this.getEntryIdentifier(o2) : o1 === o2;
  }

  addEntryToCollectionIfMissing<Type extends Pick<IEntry, 'id'>>(
    entryCollection: Type[],
    ...entriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const entries: Type[] = entriesToCheck.filter(isPresent);
    if (entries.length > 0) {
      const entryCollectionIdentifiers = entryCollection.map(entryItem => this.getEntryIdentifier(entryItem)!);
      const entriesToAdd = entries.filter(entryItem => {
        const entryIdentifier = this.getEntryIdentifier(entryItem);
        if (entryCollectionIdentifiers.includes(entryIdentifier)) {
          return false;
        }
        entryCollectionIdentifiers.push(entryIdentifier);
        return true;
      });
      return [...entriesToAdd, ...entryCollection];
    }
    return entryCollection;
  }

  protected convertDateFromClient<T extends IEntry | NewEntry | PartialUpdateEntry>(entry: T): RestOf<T> {
    return {
      ...entry,
      date: entry.date?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restEntry: RestEntry): IEntry {
    return {
      ...restEntry,
      date: restEntry.date ? dayjs(restEntry.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestEntry>): HttpResponse<IEntry> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestEntry[]>): HttpResponse<IEntry[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }

  getEntriesByCompetitionId(competitionId: number): Observable<EntityArrayResponseType> {
    return this.http.get<IEntry[]>(`${this.resourceUrl}/by-competition`, {
      params: { competitionId: competitionId.toString() },
      observe: 'response',
    });
  }

  getEntriesByUsername(username: string): Observable<EntityArrayResponseType> {
    return this.http.get<IEntry[]>(`${this.resourceUrl}/by-user`, {
      params: { username: username },
      observe: 'response',
    });
  }
}
