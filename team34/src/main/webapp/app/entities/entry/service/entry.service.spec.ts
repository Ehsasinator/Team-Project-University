import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IEntry } from '../entry.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../entry.test-samples';

import { EntryService, RestEntry } from './entry.service';

const requireRestSample: RestEntry = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.toJSON(),
};

describe('Entry Service', () => {
  let service: EntryService;
  let httpMock: HttpTestingController;
  let expectedResult: IEntry | IEntry[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(EntryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Entry', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const entry = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(entry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Entry', () => {
      const entry = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(entry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Entry', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Entry', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Entry', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addEntryToCollectionIfMissing', () => {
      it('should add a Entry to an empty array', () => {
        const entry: IEntry = sampleWithRequiredData;
        expectedResult = service.addEntryToCollectionIfMissing([], entry);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(entry);
      });

      it('should not add a Entry to an array that contains it', () => {
        const entry: IEntry = sampleWithRequiredData;
        const entryCollection: IEntry[] = [
          {
            ...entry,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addEntryToCollectionIfMissing(entryCollection, entry);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Entry to an array that doesn't contain it", () => {
        const entry: IEntry = sampleWithRequiredData;
        const entryCollection: IEntry[] = [sampleWithPartialData];
        expectedResult = service.addEntryToCollectionIfMissing(entryCollection, entry);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(entry);
      });

      it('should add only unique Entry to an array', () => {
        const entryArray: IEntry[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const entryCollection: IEntry[] = [sampleWithRequiredData];
        expectedResult = service.addEntryToCollectionIfMissing(entryCollection, ...entryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const entry: IEntry = sampleWithRequiredData;
        const entry2: IEntry = sampleWithPartialData;
        expectedResult = service.addEntryToCollectionIfMissing([], entry, entry2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(entry);
        expect(expectedResult).toContain(entry2);
      });

      it('should accept null and undefined values', () => {
        const entry: IEntry = sampleWithRequiredData;
        expectedResult = service.addEntryToCollectionIfMissing([], null, entry, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(entry);
      });

      it('should return initial array if no Entry is added', () => {
        const entryCollection: IEntry[] = [sampleWithRequiredData];
        expectedResult = service.addEntryToCollectionIfMissing(entryCollection, undefined, null);
        expect(expectedResult).toEqual(entryCollection);
      });
    });

    describe('compareEntry', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareEntry(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareEntry(entity1, entity2);
        const compareResult2 = service.compareEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareEntry(entity1, entity2);
        const compareResult2 = service.compareEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareEntry(entity1, entity2);
        const compareResult2 = service.compareEntry(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
