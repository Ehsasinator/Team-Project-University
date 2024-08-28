import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILike, NewLike } from '../like.model';

export type PartialUpdateLike = Partial<ILike> & Pick<ILike, 'id'>;

export type EntityResponseType = HttpResponse<ILike>;
export type EntityArrayResponseType = HttpResponse<ILike[]>;

@Injectable({ providedIn: 'root' })
export class LikeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/likes');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(like: NewLike): Observable<EntityResponseType> {
    return this.http.post<ILike>(this.resourceUrl, like, { observe: 'response' });
  }

  update(like: ILike): Observable<EntityResponseType> {
    return this.http.put<ILike>(`${this.resourceUrl}/${this.getLikeIdentifier(like)}`, like, { observe: 'response' });
  }

  partialUpdate(like: PartialUpdateLike): Observable<EntityResponseType> {
    return this.http.patch<ILike>(`${this.resourceUrl}/${this.getLikeIdentifier(like)}`, like, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILike>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILike[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLikeIdentifier(like: Pick<ILike, 'id'>): number {
    return like.id;
  }

  compareLike(o1: Pick<ILike, 'id'> | null, o2: Pick<ILike, 'id'> | null): boolean {
    return o1 && o2 ? this.getLikeIdentifier(o1) === this.getLikeIdentifier(o2) : o1 === o2;
  }

  addLikeToCollectionIfMissing<Type extends Pick<ILike, 'id'>>(
    likeCollection: Type[],
    ...likesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const likes: Type[] = likesToCheck.filter(isPresent);
    if (likes.length > 0) {
      const likeCollectionIdentifiers = likeCollection.map(likeItem => this.getLikeIdentifier(likeItem)!);
      const likesToAdd = likes.filter(likeItem => {
        const likeIdentifier = this.getLikeIdentifier(likeItem);
        if (likeCollectionIdentifiers.includes(likeIdentifier)) {
          return false;
        }
        likeCollectionIdentifiers.push(likeIdentifier);
        return true;
      });
      return [...likesToAdd, ...likeCollection];
    }
    return likeCollection;
  }

  getLikesByEntryId(entryId: number): Observable<EntityArrayResponseType> {
    return this.http.get<ILike[]>(`${this.resourceUrl}/by-entry`, { params: { entryId: entryId.toString() }, observe: 'response' });
  }
}
