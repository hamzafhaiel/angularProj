import { TestBed } from '@angular/core/testing';
import { ConferenceForm } from './conference-form';
import { CONFERENCES } from '../conferences';
import type { ConferenceDraft } from '../conference';

const valid: ConferenceDraft = { title: 'Angular signals', description: 'A conference about Angular reactive forms.', category: 'Web', place: 'Tunis', date: '2099-01-01', maxParticipants: 50, nbParticipants: 5 };

describe('Reusable conference reactive form', () => {
  async function create() {
    const fixture = TestBed.createComponent(ConferenceForm);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('starts invalid, disables saving, and displays validation errors after an attempted submit', async () => {
    const fixture = await create();
    const form = fixture.componentInstance;
    const emit = vi.spyOn(form.saved, 'emit');
    expect(form.isValid()).toBe(false);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    form.submit();
    fixture.detectChanges();
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Title is required');
    expect(form.form.controls.description.touched).toBe(true);
  });

  it('updates character counts, validity, available places, and button state from signals', async () => {
    const fixture = await create();
    const component = fixture.componentInstance;
    component.form.setValue(valid);
    fixture.detectChanges();
    expect(component.titleLength()).toBe(valid.title.length);
    expect(component.descriptionLength()).toBe(valid.description.length);
    expect(component.availablePlaces()).toBe(45);
    expect(component.isValid()).toBe(true);
    expect(fixture.nativeElement.querySelector('#form-status').textContent).toContain('VALID');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
    component.form.controls.title.setValue('ab');
    fixture.detectChanges();
    expect(component.titleLength()).toBe(2);
    expect(component.isValid()).toBe(false);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });

  it.each([
    ['title', '  ', 'required'], ['title', ' a ', 'minlength'], ['title', 'x'.repeat(101), 'maxlength'],
    ['description', 'short', 'minlength'], ['description', 'x'.repeat(2001), 'maxlength'],
    ['category', 'a', 'minlength'], ['place', ' ', 'required'],
    ['date', '2000-01-01', 'pastDate'], ['date', '2099-02-30', 'date'],
    ['maxParticipants', 0, 'min'], ['maxParticipants', 1.5, 'integer'],
    ['maxParticipants', 100001, 'max'], ['maxParticipants', null, 'required'],
    ['nbParticipants', -1, 'min'], ['nbParticipants', 0.5, 'integer'],
  ])('rejects invalid %s input %s with %s', async (field, value, error) => {
    const fixture = await create();
    const form = fixture.componentInstance.form;
    form.setValue(valid);
    form.get(String(field))!.setValue(value);
    expect(form.get(String(field))!.hasError(String(error))).toBe(true);
    expect(form.invalid).toBe(true);
  });

  it('validates participant counts together and shows the group error', async () => {
    const fixture = await create();
    const component = fixture.componentInstance;
    component.form.setValue({ ...valid, nbParticipants: 51 });
    component.form.controls.nbParticipants.markAsTouched();
    fixture.detectChanges();
    expect(component.form.hasError('participantLimit')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('must not exceed the maximum');
    component.form.controls.nbParticipants.setValue(50);
    expect(component.form.valid).toBe(true);
    expect(component.availablePlaces()).toBe(0);
  });

  it('emits trimmed typed values on valid submit and resets reactive feedback', async () => {
    const fixture = await create();
    const component = fixture.componentInstance;
    const emit = vi.spyOn(component.saved, 'emit');
    component.form.setValue({ ...valid, title: '  Angular signals  ' });
    component.submit();
    expect(emit).toHaveBeenCalledWith(valid);
    component.reset();
    expect(component.form.controls.title.value).toBe('');
    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
    expect(component.titleLength()).toBe(0);
    expect(component.isValid()).toBe(false);
  });

  it('prefills and resets edits, preserves an existing date, and reacts to another conference input', async () => {
    const fixture = await create();
    fixture.componentRef.setInput('conference', CONFERENCES[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    expect(component.form.valid).toBe(true);
    expect(component.form.controls.title.value).toBe('angular');
    component.form.controls.title.setValue('Changed title');
    component.reset();
    expect(component.form.controls.title.value).toBe('angular');
    fixture.componentRef.setInput('conference', CONFERENCES[1]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.form.controls.title.value).toBe('react');
    expect(component.form.pristine).toBe(true);
  });
});
