import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ConferenceApi } from './conference-api';
import { CONFERENCES } from './conferences';
import { environment } from '../environments/environment';

const URL = `${environment.apiUrl}/conferences`;

describe('Typed conference HTTP API', () => {
  let api: ConferenceApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ConferenceApi); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends no request until its Observable is consumed and lists with immutable HttpParams', async () => {
    const source = api.getAll('tunis');
    http.expectNone(() => true);
    const pending = firstValueFrom(source);
    const request = http.expectOne(req => req.url === URL && req.params.get('place') === 'tunis');
    expect(request.request.method).toBe('GET');
    request.flush([CONFERENCES[0]]);
    expect(await pending).toEqual([CONFERENCES[0]]);
  });

  it('fetches a conference by numeric ID', async () => {
    const pending = firstValueFrom(api.getById(2));
    const request = http.expectOne(`${URL}/2`);
    expect(request.request.method).toBe('GET'); request.flush(CONFERENCES[1]);
    expect(await pending).toEqual(CONFERENCES[1]);
  });

  it('POSTs without a client-generated ID and accepts the server ID', async () => {
    const { id: _id, ...draft } = CONFERENCES[0];
    const pending = firstValueFrom(api.create(draft));
    const request = http.expectOne(URL);
    expect(request.request.method).toBe('POST'); expect(request.request.body).not.toHaveProperty('id');
    request.flush({ ...draft, id: 42 }); expect((await pending).id).toBe(42);
  });

  it('sends a full PUT and a partial PATCH', async () => {
    const update = firstValueFrom(api.update(CONFERENCES[0]));
    const put = http.expectOne(`${URL}/1`);
    expect(put.request.method).toBe('PUT'); expect(put.request.body).toEqual(CONFERENCES[0]);
    put.flush(CONFERENCES[0]); await update;
    const patch = firstValueFrom(api.updateCapacity(1, 120));
    const request = http.expectOne(`${URL}/1`);
    expect(request.request.method).toBe('PATCH'); expect(request.request.body).toEqual({ maxParticipants: 120 });
    request.flush({ ...CONFERENCES[0], maxParticipants: 120 });
    expect((await patch).maxParticipants).toBe(120);
  });

  it('DELETEs the requested resource', async () => {
    const pending = firstValueFrom(api.remove(3));
    const request = http.expectOne(`${URL}/3`);
    expect(request.request.method).toBe('DELETE'); request.flush({}); await pending;
  });

  it.each([0, 404, 500])('preserves HTTP error status %s with a readable message', async status => {
    const pending = firstValueFrom(api.getById(999));
    const check = expect(pending).rejects.toMatchObject({ status });
    const request = http.expectOne(`${URL}/999`);
    if (status === 0) request.error(new ProgressEvent('error')); else request.flush({}, { status, statusText: 'Failure' });
    await check;
  });
});
