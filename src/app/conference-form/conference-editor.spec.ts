import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { routes } from '../app.routes';
import { ConferenceStore } from '../conference-store';
import { RegistrationStore } from '../registration/registration-store';
import { ConferenceEditor } from './conference-editor';

describe('Conference form navigation', () => {
  beforeEach(() => {
    sessionStorage.removeItem('angularProj.conferences');
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });
  afterEach(() => { vi.restoreAllMocks(); sessionStorage.removeItem('angularProj.conferences'); sessionStorage.removeItem('angularProj.registeredConferences'); });

  function fill(page: HTMLElement) {
    for (const [id, value] of Object.entries({ title: 'Signals workshop', description: 'A complete workshop on Angular reactive forms.', category: 'Workshop', place: 'Tunis', date: '2099-05-10', maximum: '40', participants: '2' })) {
      const input = page.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  it('adds a conference through DOM inputs and makes it available to details, list, and registration', async () => {
    const harness = await RouterTestingHarness.create('/list/new');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Add conference');
    fill(harness.routeNativeElement!);
    harness.detectChanges();
    const save = harness.routeNativeElement!.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(save.disabled).toBe(false);
    const router = TestBed.inject(Router);
    const completed = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    save.click();
    await completed;
    harness.detectChanges();
    expect(router.url).toBe('/list/4');
    expect(harness.routeNativeElement?.textContent).toContain('Signals workshop');
    await harness.navigateByUrl('/list');
    expect(harness.routeNativeElement?.querySelectorAll('.card').length).toBe(4);
    await harness.navigateByUrl('/registration/4');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Signals workshop');
    expect(TestBed.inject(RegistrationStore).register(4)).toBe(true);
  });

  it('prefills an existing conference and saves an edit to its original ID', async () => {
    const harness = await RouterTestingHarness.create('/list/1/edit');
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('#title')!;
    expect(input.value).toBe('angular');
    input.value = 'Angular updated';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    harness.detectChanges();
    const router = TestBed.inject(Router);
    const completed = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await completed;
    harness.detectChanges();
    expect(router.url).toBe('/list/1');
    expect(harness.routeNativeElement?.textContent).toContain('Angular updated');
    expect(TestBed.inject(ConferenceStore).conferences().length).toBe(3);
  });

  it('handles an unknown edit ID without presenting a creation form', async () => {
    const harness = await RouterTestingHarness.create('/list/999/edit');
    expect(harness.routeNativeElement?.textContent).toContain('Conference not found');
    expect(harness.routeNativeElement?.querySelector('form')).toBeNull();
  });

  it('shows storage errors and keeps entered values for retry', async () => {
    const harness = await RouterTestingHarness.create('/list/new');
    fill(harness.routeNativeElement!);
    harness.detectChanges();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Unavailable'); });
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/list/new');
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain('Unable to save the conference');
    expect(harness.routeNativeElement!.querySelector<HTMLInputElement>('#title')!.value).toBe('Signals workshop');
  });

  it('prevents duplicate submissions and reuses the saved ID if navigation must be retried', async () => {
    const harness = await RouterTestingHarness.create('/list/new');
    const editor = harness.routeDebugElement!.componentInstance as ConferenceEditor;
    const draft = { title: 'Signals workshop', description: 'A complete workshop on Angular reactive forms.', category: 'Workshop', place: 'Tunis', date: '2099-05-10', maxParticipants: 40, nbParticipants: 2 };
    let finish!: (value: boolean) => void;
    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const pending = editor.save(draft);
    await editor.save(draft);
    expect(TestBed.inject(ConferenceStore).conferences().length).toBe(4);
    expect(editor.saving()).toBe(true);
    finish(false);
    await pending;
    expect(editor.error()).toContain('Conference saved');
    const retry = editor.save(draft);
    finish(false);
    await retry;
    expect(TestBed.inject(ConferenceStore).conferences().length).toBe(4);
    expect(editor.saving()).toBe(false);
  });
});
