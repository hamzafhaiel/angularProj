import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { filter, firstValueFrom } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const URL = `${environment.apiUrl}/conferences`;
const sample = { id: 1, name: 'Angular Conference', date: '2026-10-15', place: 'Tunis' };

describe('Teacher application routing', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function open(url: string) {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url); fixture.detectChanges();
    return fixture;
  }

  it('redirects the empty URL to the teacher home examples', async () => {
    const fixture = await open('/'); await fixture.whenStable(); fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('interpolation mohamed');
  });

  it('navigates from Details to /details/:id and returns to the list', async () => {
    const fixture = await open('/list');
    http.expectOne(URL).flush([sample]); await fixture.whenStable(); fixture.detectChanges();
    const router = TestBed.inject(Router);
    const opened = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    fixture.nativeElement.querySelector('.card button').click(); await opened; fixture.detectChanges();
    expect(router.url).toBe('/details/1');
    http.expectOne(`${URL}/1`).flush(sample); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(sample.name);
    const returned = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    fixture.nativeElement.querySelector('.return-button').click(); await returned; fixture.detectChanges();
    http.expectOne(URL).flush([sample]); await fixture.whenStable(); fixture.detectChanges();
    expect(router.url).toBe('/list');
  });

  it('binds a direct details URL to input.required and reacts when its ID changes', async () => {
    const fixture = await open('/details/1');
    http.expectOne(`${URL}/1`).flush(sample); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(sample.name);
    await TestBed.inject(Router).navigateByUrl('/details/2'); fixture.detectChanges();
    http.expectOne(`${URL}/2`).flush({ ...sample, id: 2, name: 'Java Conference' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Java Conference');
  });

  it('shows the teacher fallback for an unknown path', async () => {
    const fixture = await open('/missing'); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-notfound')).toBeTruthy();
  });

  it('opens the add form from the list and displays the server-created conference after POST', async () => {
    const fixture = await open('/list');
    http.expectOne(URL).flush([sample]); await fixture.whenStable(); fixture.detectChanges();
    const router = TestBed.inject(Router);
    const opened = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    fixture.nativeElement.querySelector('.add-link').click(); await opened; fixture.detectChanges();
    expect(router.url).toBe('/add');
    for (const [id, value] of Object.entries({ 'add-name': 'New Angular Conference', 'add-date': '2099-06-15', 'add-place': 'Sousse' })) {
      const input = fixture.nativeElement.querySelector(`#${id}`);
      input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    fixture.detectChanges();
    const navigated = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    const created = { id: 77, name: 'New Angular Conference', date: '2099-06-15', place: 'Sousse' };
    const post = http.expectOne(URL); expect(post.request.method).toBe('POST'); post.flush(created);
    await navigated; fixture.detectChanges();
    expect(router.url).toBe('/details/77');
    http.expectOne(`${URL}/77`).flush(created); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(created.name);
  });
});
