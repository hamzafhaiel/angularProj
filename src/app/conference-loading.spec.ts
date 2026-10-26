import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { routes } from './app.routes';
import { CONFERENCES } from './conferences';
import { environment } from '../environments/environment';

const URL = `${environment.apiUrl}/conferences`;

describe('Asynchronous conference page states', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.removeItem('angularProj.registeredConferences');
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.removeItem('angularProj.registeredConferences'); });

  async function open(url: string) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    return fixture;
  }

  it('shows loading then an API error, and retries before deciding whether a detail exists', async () => {
    const fixture = await open('/list/1');
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Loading conference');
    expect(page.querySelector('app-notfound')).toBeNull();
    http.expectOne(URL).error(new ProgressEvent('error'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('API unreachable');
    expect(page.querySelector('app-notfound')).toBeNull();
    page.querySelector<HTMLButtonElement>('app-conference-page button')!.click();
    fixture.detectChanges();
    expect(page.textContent).toContain('Loading conference');
    http.expectOne(URL).flush(CONFERENCES);
    await fixture.whenStable(); fixture.detectChanges();
    expect(page.querySelector('h2')?.textContent).toContain('angular');
  });

  it('preserves session registration IDs while waiting for conferences from HTTP', async () => {
    sessionStorage.setItem('angularProj.registeredConferences', '[1]');
    const fixture = await open('/registration/1/confirmation');
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Loading conference');
    expect(page.textContent).not.toContain('No registration found');
    http.expectOne(URL).flush(CONFERENCES);
    await fixture.whenStable(); fixture.detectChanges();
    expect(page.querySelector('h1')?.textContent).toBe('Registration confirmed');
  });
});
