import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConferanceAdd } from './conferance-add';
import { environment } from '../../environments/environment';

const URL = `${environment.apiUrl}/conferences`;
const draft = { name: 'Angular Workshop', date: '2099-06-15', place: 'Tunis' };

describe('Conference add form and POST consumption', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConferanceAdd], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('starts invalid and refuses to POST empty or whitespace-only fields', async () => {
    const fixture = TestBed.createComponent(ConferanceAdd); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    await fixture.componentInstance.ajouter(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Le nom est obligatoire');
    fixture.componentInstance.form.setValue({ ...draft, name: '   ' });
    await fixture.componentInstance.ajouter();
    http.expectNone(() => true);
  });

  it.each([
    ['name', 'x'.repeat(101), 'maxlength'],
    ['place', 'x'.repeat(121), 'maxlength'],
    ['place', '   ', 'required'],
    ['date', '2026-02-30', 'date'],
  ])('rejects invalid %s before sending a request', async (field, value, error) => {
    const fixture = TestBed.createComponent(ConferanceAdd); fixture.detectChanges();
    fixture.componentInstance.form.setValue(draft);
    fixture.componentInstance.form.get(field)!.setValue(value);
    await fixture.componentInstance.ajouter();
    expect(fixture.componentInstance.form.get(field)!.hasError(error)).toBe(true);
    http.expectNone(() => true);
  });

  it('consumes POST without an ID, trims values, blocks duplicates and navigates after success', async () => {
    const fixture = TestBed.createComponent(ConferanceAdd); fixture.detectChanges();
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.setValue({ ...draft, name: '  Angular Workshop  ', place: ' Tunis ' });
    const pending = component.ajouter(); fixture.detectChanges();
    const request = http.expectOne(URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(draft);
    expect(request.request.body).not.toHaveProperty('id');
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    await component.ajouter(); http.expectNone(() => true);
    request.flush({ ...draft, id: 42 }); await pending;
    expect(navigate).toHaveBeenCalledWith(['/details', 42]);
    expect(component.saving()).toBe(false);
  });

  it('retains values after a failed POST and permits a retry', async () => {
    const fixture = TestBed.createComponent(ConferanceAdd); fixture.detectChanges();
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.setValue(draft);
    const pending = component.ajouter();
    http.expectOne(URL).flush({}, { status: 500, statusText: 'Failure' }); await pending; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
    expect(component.form.getRawValue()).toEqual(draft);
    expect(component.saving()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    const retry = component.ajouter(); http.expectOne(URL).flush({ ...draft, id: 4 }); await retry;
    expect(navigate).toHaveBeenCalledWith(['/details', 4]);
  });

  it('retries navigation without a second POST if the conference was already created', async () => {
    const fixture = TestBed.createComponent(ConferanceAdd); fixture.detectChanges();
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValueOnce(false).mockResolvedValue(true);
    component.form.setValue(draft);
    const pending = component.ajouter(); http.expectOne(URL).flush({ ...draft, id: 4 }); await pending;
    expect(component.error()).toContain('Conférence ajoutée');
    await component.ajouter(); http.expectNone(() => true);
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(component.createdId()).toBe(4);
  });
});
