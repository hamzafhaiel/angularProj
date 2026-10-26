import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConferanceList } from './conferance-list';
import { environment } from '../../environments/environment';

const URL = `${environment.apiUrl}/conferences`;
const sample = { id: 1, name: 'Angular Conference', date: '2026-10-15', place: 'Tunis' };

describe('Teacher conference list over HTTP', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConferanceList], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('shows loading first and then the teacher card with its Details route', async () => {
    const fixture = TestBed.createComponent(ConferanceList);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading conferences');
    http.expectOne(URL).flush([sample]);
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe(sample.name);
    expect(fixture.nativeElement.querySelector('.card button').textContent).toBe('Details');
    expect(fixture.componentInstance.conferances()).toEqual([sample]);
  });

  it('shows the empty state for an empty API result', async () => {
    const fixture = TestBed.createComponent(ConferanceList); fixture.detectChanges();
    http.expectOne(URL).flush([]); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No conferences available');
  });

  it('recovers from an API error through Retry', async () => {
    const fixture = TestBed.createComponent(ConferanceList); fixture.detectChanges();
    http.expectOne(URL).error(new ProgressEvent('error'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('API unreachable');
    fixture.nativeElement.querySelector('button').click(); fixture.detectChanges();
    http.expectOne(URL).flush([sample]); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe(sample.name);
  });

  it('cancels its pending request on destruction', () => {
    const fixture = TestBed.createComponent(ConferanceList); fixture.detectChanges();
    const request = http.expectOne(URL); fixture.destroy();
    expect(request.cancelled).toBe(true);
  });

  it('consumes DELETE once and refreshes the list only after success', async () => {
    const fixture = TestBed.createComponent(ConferanceList); fixture.detectChanges();
    http.expectOne(URL).flush([sample]); await fixture.whenStable(); fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click(); fixture.detectChanges();
    const deletion = http.expectOne(`${URL}/1`);
    expect(deletion.request.method).toBe('DELETE');
    expect(fixture.componentInstance.conferances()).toEqual([sample]);
    expect(fixture.nativeElement.querySelector('.delete-button').disabled).toBe(true);
    fixture.componentInstance.supprimer(1);
    http.expectNone(`${URL}/1`);
    deletion.flush({}); fixture.detectChanges();
    http.expectOne(URL).flush([]); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Conference deleted');
    expect(fixture.nativeElement.textContent).toContain('No conferences available');
    expect(fixture.nativeElement.querySelector('.card')).toBeNull();
  });

  it('keeps a conference visible after a failed DELETE and supports another attempt', async () => {
    const fixture = TestBed.createComponent(ConferanceList); fixture.detectChanges();
    http.expectOne(URL).flush([sample]); await fixture.whenStable(); fixture.detectChanges();
    fixture.componentInstance.supprimer(1);
    http.expectOne(`${URL}/1`).flush({}, { status: 500, statusText: 'Failure' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe(sample.name);
    expect(fixture.componentInstance.deletingId()).toBeNull();
    fixture.componentInstance.supprimer(1);
    http.expectOne(`${URL}/1`).flush({}); fixture.detectChanges();
    http.expectOne(URL).flush([]); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
