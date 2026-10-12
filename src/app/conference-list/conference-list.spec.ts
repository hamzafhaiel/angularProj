import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceList } from './conference-list';

describe('ConferenceList', () => {
  let component: ConferenceList;
  let fixture: ComponentFixture<ConferenceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceList],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferenceList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows details for each card and closes them', () => {
    const page = fixture.nativeElement as HTMLElement;
    const buttons = page.querySelectorAll<HTMLButtonElement>('.card button');
    expect(buttons.length).toBe(3);

    component.conferences.forEach((conference, index) => {
      expect(buttons[index].textContent?.trim()).toBe('View details');
      buttons[index].click();
      fixture.detectChanges();
      const details = page.querySelector('.details-panel');
      expect(details?.querySelector('h2')?.textContent).toContain(conference.name);
      expect(details?.textContent).toContain(conference.date);
      expect(details?.textContent).toContain(conference.place);
      expect(buttons[index].getAttribute('aria-expanded')).toBe('true');
    });

    page.querySelector<HTMLButtonElement>('.details-panel button')!.click();
    fixture.detectChanges();
    expect(page.querySelector('.details-panel')).toBeNull();
  });
});
