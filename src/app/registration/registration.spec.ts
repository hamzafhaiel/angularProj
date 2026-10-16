import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { routes } from '../app.routes';
import { RegistrationStore } from './registration-store';

const STORAGE_KEY = 'angularProj.registeredConferences';

describe('Dynamic registration navigation', () => {
  beforeEach(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.removeItem(STORAGE_KEY);
  });

  it('carries the selected conference from details through registration to confirmation', async () => {
    const harness = await RouterTestingHarness.create('/list/2');
    const router = TestBed.inject(Router);
    const registration = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a[href="/registration/2"]')!.click();
    await registration;
    harness.detectChanges();
    expect(router.url).toBe('/registration/2');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('react');

    const confirmation = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('button')!.click();
    await confirmation;
    harness.detectChanges();
    expect(router.url).toBe('/registration/2/confirmation');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Registration confirmed');
    expect(harness.routeNativeElement?.textContent).toContain('react');
    expect(harness.routeNativeElement?.textContent).toContain('sfax');
    expect(new RegistrationStore().isRegistered(2)).toBe(true);
  });

  it('reacts to a different id while reusing the registration page', async () => {
    const harness = await RouterTestingHarness.create('/registration/1');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('angular');
    await harness.navigateByUrl('/registration/3');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('vue');
    expect(harness.routeNativeElement?.textContent).toContain('sousse');
  });

  it('offers conference choices when no id is provided', async () => {
    const harness = await RouterTestingHarness.create('/registration');
    expect(harness.routeNativeElement?.querySelectorAll('li a').length).toBe(3);
    expect(harness.routeNativeElement?.querySelector('button')).toBeNull();
  });

  it.each(['/registration/999', '/registration/invalid'])('rejects an unknown id at %s', async url => {
    const harness = await RouterTestingHarness.create(url);
    expect(harness.routeNativeElement?.textContent).toContain('Conference not found');
    expect(harness.routeNativeElement?.querySelector('button')).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does not show a successful confirmation without a registration', async () => {
    const harness = await RouterTestingHarness.create('/registration/1/confirmation');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('No registration found');
    expect(harness.routeNativeElement?.querySelector('a')?.getAttribute('href')).toBe('/registration/1');
  });

  it('restores a confirmed registration when its URL is reopened', async () => {
    sessionStorage.setItem(STORAGE_KEY, '[3]');
    const harness = await RouterTestingHarness.create('/registration/3/confirmation');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Registration confirmed');
    expect(harness.routeNativeElement?.textContent).toContain('vue');
    await harness.navigateByUrl('/registration/1/confirmation');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('No registration found');
  });

  it('handles an unknown id on the confirmation page', async () => {
    const harness = await RouterTestingHarness.create('/registration/999/confirmation');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Conference not found');
  });

  it('stays on registration and explains a storage failure', async () => {
    const harness = await RouterTestingHarness.create('/registration/1');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('button')!.click();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/registration/1');
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain('Unable to save registration');
    expect(TestBed.inject(RegistrationStore).isRegistered(1)).toBe(false);
  });

  it('ignores malformed stored data and prevents duplicate or invalid registrations', () => {
    sessionStorage.setItem(STORAGE_KEY, '{broken');
    const store = new RegistrationStore();
    expect(store.isRegistered(1)).toBe(false);
    expect(store.register(999)).toBe(false);
    expect(store.register(1)).toBe(true);
    expect(store.register(1)).toBe(true);
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!)).toEqual([1]);
  });
});
