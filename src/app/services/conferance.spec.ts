import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { Conferance } from './conferance';
import { environment } from '../../environments/environment';

const URL = `${environment.apiUrl}/conferences`;
const sample = { id: 1, name: 'Angular Conference', date: '2026-10-15', place: 'Tunis' };

describe('Teacher Conferance service with HttpClient', () => {
  let service: Conferance;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Conferance); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('returns a cold typed GET Observable with an optional place filter', async () => {
    const source = service.getAll('Tunis');
    http.expectNone(() => true);
    const result = firstValueFrom(source);
    const request = http.expectOne(req => req.url === URL && req.params.get('place') === 'Tunis');
    expect(request.request.method).toBe('GET'); request.flush([sample]);
    expect(await result).toEqual([sample]);
  });

  it('GETs a conference by numeric ID', async () => {
    const result = firstValueFrom(service.getById(1));
    const request = http.expectOne(`${URL}/1`);
    expect(request.request.method).toBe('GET'); request.flush(sample);
    expect(await result).toEqual(sample);
  });

  it('POSTs without an ID, PUTs the complete object, PATCHes a subset, and DELETEs by ID', async () => {
    const { id: _id, ...draft } = sample;
    const creation = firstValueFrom(service.add(draft));
    const post = http.expectOne(URL);
    expect(post.request.method).toBe('POST'); expect(post.request.body).not.toHaveProperty('id');
    post.flush({ ...draft, id: 4 }); expect((await creation).id).toBe(4);
    const replacement = firstValueFrom(service.update(sample));
    const put = http.expectOne(`${URL}/1`);
    expect(put.request.method).toBe('PUT'); expect(put.request.body).toEqual(sample);
    put.flush(sample); await replacement;
    const change = firstValueFrom(service.patch(1, { place: 'Sousse' }));
    const patch = http.expectOne(`${URL}/1`);
    expect(patch.request.method).toBe('PATCH'); expect(patch.request.body).toEqual({ place: 'Sousse' });
    patch.flush({ ...sample, place: 'Sousse' }); await change;
    const deletion = firstValueFrom(service.delete(1));
    const remove = http.expectOne(`${URL}/1`);
    expect(remove.request.method).toBe('DELETE'); remove.flush({}); await deletion;
  });

  it.each([0, 404, 500])('exposes a readable error preserving status %s', async status => {
    const result = firstValueFrom(service.getById(99));
    const rejected = expect(result).rejects.toMatchObject({ status });
    const request = http.expectOne(`${URL}/99`);
    if (status === 0) request.error(new ProgressEvent('error'));
    else request.flush({}, { status, statusText: 'Failure' });
    await rejected;
  });
});
