import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConferenceStore } from './conference-store';
import { CONFERENCES } from './conferences';
import type { ConferenceDraft } from './conference';
import { environment } from '../environments/environment';

const URL = `${environment.apiUrl}/conferences`;
const valid: ConferenceDraft = { title: 'New conference', description: 'Learn about Angular reactive forms.', category: 'Technology', date: '2099-01-01', place: 'Tunis', maxParticipants: 30, nbParticipants: 0 };

describe('HTTP conference Signal store', () => {
  let store: ConferenceStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(ConferenceStore);
  });
  afterEach(() => http.verify());
  const seed = () => http.expectOne(URL).flush(CONFERENCES);

  it('exposes loading, success and count signals, including a valid empty list', () => {
    expect(store.loading()).toBe(true); expect(store.loaded()).toBe(false);
    seed(); expect(store.count()).toBe(3); expect(store.loading()).toBe(false);
    store.load(); http.expectOne(URL).flush([]);
    expect(store.loaded()).toBe(true); expect(store.count()).toBe(0); expect(store.error()).toBeNull();
  });

  it('shows a network failure and recovers on retry without using session fallback data', () => {
    http.expectOne(URL).error(new ProgressEvent('error'));
    expect(store.loaded()).toBe(false); expect(store.loading()).toBe(false);
    expect(store.error()).toContain('API unreachable'); expect(store.count()).toBe(0);
    store.load(); seed(); expect(store.error()).toBeNull(); expect(store.count()).toBe(3);
  });

  it('waits for the server-generated ID before adding and PUTs an edit without duplication', async () => {
    seed();
    const add = store.save(valid);
    expect(store.count()).toBe(3); expect(store.mutating()).toBe(true);
    const post = http.expectOne(URL); expect(post.request.method).toBe('POST');
    expect(post.request.body).not.toHaveProperty('id');
    post.flush({ ...valid, id: 42 }); expect((await add).id).toBe(42); expect(store.count()).toBe(4);
    const edit = store.save({ ...valid, title: 'Edited conference' }, 42);
    const put = http.expectOne(`${URL}/42`); expect(put.request.method).toBe('PUT');
    put.flush({ ...valid, title: 'Edited conference', id: 42 }); await edit;
    expect(store.find(42)?.title).toBe('Edited conference'); expect(store.count()).toBe(4);
  });

  it('does not mutate the list on failed writes and permits a retry', async () => {
    seed();
    const pending = store.save(valid);
    const rejected = expect(pending).rejects.toMatchObject({ status: 500 });
    http.expectOne(URL).flush({}, { status: 500, statusText: 'Failure' }); await rejected;
    expect(store.count()).toBe(3); expect(store.mutating()).toBe(false);
    const retry = store.save(valid); http.expectOne(URL).flush({ ...valid, id: 4 }); await retry;
    expect(store.error()).toBeNull(); expect(store.count()).toBe(4);
  });

  it('validates fields, dates and capacity before sending writes', async () => {
    seed();
    await expect(store.save({ ...valid, title: ' ' })).rejects.toThrow();
    await expect(store.save({ ...valid, nbParticipants: 31 })).rejects.toThrow();
    await expect(store.save({ ...valid, date: '2000-01-01' })).rejects.toThrow('today or a future date');
    await expect(store.save(valid, 999)).rejects.toThrow('Conference not found');
    await expect(store.updateCapacity(1, -1)).rejects.toThrow();
    http.expectNone(() => true);
  });

  it('PATCHes only capacity and keeps the other fields, then DELETEs after server success', async () => {
    seed();
    const patch = store.updateCapacity(1, 110);
    const request = http.expectOne(`${URL}/1`);
    expect(request.request.method).toBe('PATCH'); expect(request.request.body).toEqual({ maxParticipants: 110 });
    request.flush({ ...CONFERENCES[0], maxParticipants: 110 }); await patch;
    expect(store.find(1)?.title).toBe('angular'); expect(store.find(1)?.maxParticipants).toBe(110);
    const remove = store.remove(1); expect(store.find(1)).toBeTruthy();
    const deletion = http.expectOne(`${URL}/1`); expect(deletion.request.method).toBe('DELETE');
    deletion.flush({}); await remove;
    expect(store.find(1)).toBeUndefined(); expect(store.count()).toBe(2);
  });

  it('keeps an item after a failed DELETE and unlocks mutations', async () => {
    seed();
    const remove = store.remove(2); const check = expect(remove).rejects.toMatchObject({ status: 404 });
    http.expectOne(`${URL}/2`).flush({}, { status: 404, statusText: 'Not Found' }); await check;
    expect(store.find(2)).toBeTruthy(); expect(store.mutating()).toBe(false);
  });

  it('prevents a reload or competing write from overwriting an in-flight mutation', async () => {
    seed();
    const pending = store.save(valid);
    store.load(); await expect(store.remove(1)).rejects.toThrow('in progress');
    const request = http.expectOne(URL); expect(request.request.method).toBe('POST');
    request.flush({ ...valid, id: 4 }); await pending;
    expect(store.count()).toBe(4);
  });

  it('rejects malformed and duplicate API responses instead of showing them as valid data', () => {
    http.expectOne(URL).flush([{ id: 1 }]); expect(store.loaded()).toBe(false);
    expect(store.error()).toContain('invalid conference data');
    store.load(); http.expectOne(URL).flush([...CONFERENCES, CONFERENCES[0]]);
    expect(store.count()).toBe(0); expect(store.loading()).toBe(false);
  });
});
