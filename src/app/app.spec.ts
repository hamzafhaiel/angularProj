import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { RouterTestingHarness } from '@angular/router/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { NavigationEnd } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideLocationMocks()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  async function renderRoute(url: string) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('redirects the root to the home binding examples', async () => {
    const page = await renderRoute('/');
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(page.querySelector('h1')?.textContent).toContain('interpolation mohamed');
    expect(page.querySelector('app-header')).toBeTruthy();
    expect(page.querySelector('app-footer')).toBeTruthy();
  });

  it('renders all three reference conferences on the list route', async () => {
    const page = await renderRoute('/list');
    const titles = Array.from(page.querySelectorAll('.card h2'), node => node.textContent?.trim());
    expect(titles).toEqual(['angular', 'react', 'vue']);
  });

  it('renders the fallback page for an unknown route', async () => {
    const page = await renderRoute('/missing-page');
    expect(page.querySelector('app-notfound')).toBeTruthy();
    expect(page.querySelector('app-home')).toBeNull();
  });

  it('opens a conference directly and updates details when the URL id changes', async () => {
    const harness = await RouterTestingHarness.create('/list/1');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toContain('angular');
    await harness.navigateByUrl('/list/2');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toContain('react');
    expect(harness.routeNativeElement?.textContent).toContain('sfax');
  });

  it('navigates from View details and returns to the list on close', async () => {
    const harness = await RouterTestingHarness.create('/list');
    const router = TestBed.inject(Router);
    const opened = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    harness.routeNativeElement?.querySelector<HTMLAnchorElement>('.details-link')!.click();
    await opened;
    harness.detectChanges();
    expect(router.url).toBe('/list/1');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toContain('angular');

    const closed = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    harness.routeNativeElement?.querySelector<HTMLButtonElement>('.details-panel button')!.click();
    await closed;
    harness.detectChanges();
    expect(router.url).toBe('/list');
    expect(harness.routeNativeElement?.querySelectorAll('.card').length).toBe(3);
  });

  it('restores list and details using browser back and forward history', async () => {
    const harness = await RouterTestingHarness.create('/list');
    await harness.navigateByUrl('/list/3');
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    router.setUpLocationChangeListener();

    const back = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    location.back();
    await back;
    harness.detectChanges();
    expect(router.url).toBe('/list');

    const forward = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    location.forward();
    await forward;
    harness.detectChanges();
    expect(router.url).toBe('/list/3');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toContain('vue');
  });

  it('handles an unknown conference id with a return link', async () => {
    const page = await renderRoute('/list/999');
    expect(page.querySelector('h1')?.textContent).toBe('Conference not found');
    expect(page.querySelector('app-conference-page a')?.getAttribute('href')).toBe('/list');
  });
});
