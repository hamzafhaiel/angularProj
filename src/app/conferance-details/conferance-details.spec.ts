import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConferanceDetails } from './conferance-details';
import { environment } from '../../environments/environment';

const URL = `${environment.apiUrl}/conferences`;
const first = { id: 1, name: 'Angular Conference', date: '2026-10-15', place: 'Tunis' };
const second = { id: 2, name: 'Java Conference', date: '2026-10-20', place: 'Sousse' };

describe('Teacher conference details with route input and HTTP', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConferanceDetails], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('waits for the response before accessing conference fields', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading conference');
    expect(fixture.nativeElement.querySelector('.card')).toBeNull();
    http.expectOne(`${URL}/1`).flush(first); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(first.name);
    expect(fixture.nativeElement.textContent).toContain(first.place);
  });

  it('cancels an old request and loads the new ID when the input changes', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
    const old = http.expectOne(`${URL}/1`);
    fixture.componentRef.setInput('id', '2'); fixture.detectChanges();
    expect(old.cancelled).toBe(true);
    http.expectOne(`${URL}/2`).flush(second); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(second.name);
  });

  it('handles a server 404 without dereferencing undefined', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '999'); fixture.detectChanges();
    http.expectOne(`${URL}/999`).flush({}, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Conference not found');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/list');
  });

  it.each(['abc', '0', '-1', '9007199254740992'])('rejects invalid ID %s without an HTTP request', async id => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', id); fixture.detectChanges();
    await fixture.whenStable(); fixture.detectChanges();
    http.expectNone(() => true);
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Conference not found');
  });

  it('lets a failed detail request retry', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
    http.expectOne(`${URL}/1`).error(new ProgressEvent('error'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Unable to load conference');
    fixture.nativeElement.querySelector('button').click(); fixture.detectChanges();
    http.expectOne(`${URL}/1`).flush(first); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(first.name);
  });

  it('prefills the edit form and consumes a complete PUT before refreshing details', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
    http.expectOne(`${URL}/1`).flush(first); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance;
    component.modifier(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#edit-name').value).toBe(first.name);
    const input = fixture.nativeElement.querySelector('#edit-name');
    input.value = 'Angular Updated'; input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[type="submit"]').click(); fixture.detectChanges();
    const put = http.expectOne(`${URL}/1`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ ...first, name: 'Angular Updated' });
    expect(component.saving()).toBe(true);
    component.enregistrer(); http.expectNone(`${URL}/1`);
    put.flush({ ...first, name: 'Angular Updated' }); fixture.detectChanges();
    http.expectOne(`${URL}/1`).flush({ ...first, name: 'Angular Updated' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Angular Updated');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('blocks invalid form values and lets the user cancel without a PUT', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
    http.expectOne(`${URL}/1`).flush(first); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance;
    component.modifier(); component.editForm.controls.name.setValue('   ');
    component.enregistrer(); fixture.detectChanges();
    http.expectNone(() => true);
    expect(fixture.nativeElement.textContent).toContain('Le nom est obligatoire');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    component.editForm.controls.name.setValue(first.name);
    component.editForm.controls.date.setValue('2026-02-30');
    component.enregistrer(); expect(component.editForm.controls.date.hasError('date')).toBe(true);
    component.annuler(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(component.conference()).toEqual(first);
  });

  it('keeps entered values after a failed PUT and retries successfully', async () => {
    const fixture = TestBed.createComponent(ConferanceDetails);
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
    http.expectOne(`${URL}/1`).flush(first); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance;
    component.modifier(); component.editForm.controls.place.setValue('Sousse'); component.enregistrer();
    http.expectOne(`${URL}/1`).flush({}, { status: 500, statusText: 'Failure' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(component.editing()).toBe(true);
    expect(component.saving()).toBe(false);
    expect(fixture.nativeElement.querySelector('#edit-place').value).toBe('Sousse');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
    component.enregistrer();
    http.expectOne(`${URL}/1`).flush({ ...first, place: 'Sousse' }); fixture.detectChanges();
    http.expectOne(`${URL}/1`).flush({ ...first, place: 'Sousse' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(component.conference()?.place).toBe('Sousse');
  });
});
