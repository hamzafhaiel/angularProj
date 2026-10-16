import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceDetails } from './conference-details';
import { provideRouter } from '@angular/router';

describe('ConferenceDetails', () => {
  let component: ConferenceDetails;
  let fixture: ComponentFixture<ConferenceDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceDetails],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferenceDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
