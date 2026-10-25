import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceList } from './conference-list';
import { provideRouter } from '@angular/router';

describe('ConferenceList', () => {
  let component: ConferenceList;
  let fixture: ComponentFixture<ConferenceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferenceList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides a shareable details link for each card', () => {
    const page = fixture.nativeElement as HTMLElement;
    const buttons = page.querySelectorAll<HTMLAnchorElement>('.card .details-link');
    expect(buttons.length).toBe(3);

    component.conferences().forEach((conference, index) => {
      expect(buttons[index].textContent?.trim()).toBe('View details');
      expect(buttons[index].getAttribute('href')).toBe('/list/' + conference.id);
    });
  });
});
