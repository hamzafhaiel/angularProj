import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
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
});
