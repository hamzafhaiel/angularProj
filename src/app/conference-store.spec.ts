import { ConferenceStore } from './conference-store';
import { CONFERENCES } from './conferences';
import type { ConferenceDraft } from './conference';

const KEY = 'angularProj.conferences';
const valid: ConferenceDraft = { title: 'New conference', description: 'Learn about Angular reactive forms.', category: 'Technology', date: '2099-01-01', place: 'Tunis', maxParticipants: 30, nbParticipants: 0 };

describe('Conference store', () => {
  beforeEach(() => sessionStorage.removeItem(KEY));
  afterEach(() => { vi.restoreAllMocks(); sessionStorage.removeItem(KEY); });

  it('saves unique IDs, restores added conferences, and edits without duplicating entries', () => {
    const store = new ConferenceStore();
    const first = store.save(valid);
    const second = store.save({ ...valid, title: 'Another conference' });
    expect(first.id).toBe(4);
    expect(second.id).toBe(5);
    store.save({ ...valid, title: 'Edited conference' }, first.id);
    expect(store.conferences().length).toBe(5);
    expect(new ConferenceStore().find(first.id)?.title).toBe('Edited conference');
  });

  it('rejects invalid data, past creation dates, and edits to missing IDs', () => {
    const store = new ConferenceStore();
    expect(() => store.save({ ...valid, title: ' ' })).toThrow();
    expect(() => store.save({ ...valid, nbParticipants: 31 })).toThrow();
    expect(() => store.save({ ...valid, date: '2000-01-01' })).toThrow('today or a future date');
    expect(() => store.save(valid, 999)).toThrow('Conference not found');
    expect(store.conferences().length).toBe(3);
    expect(store.save({ ...CONFERENCES[0], title: 'Updated Angular' }, 1).date).toBe('2023-01-01');
  });

  it.each(['{broken', '{}', '[]', JSON.stringify([...CONFERENCES, CONFERENCES[0]])])('ignores malformed or duplicate stored data', value => {
    sessionStorage.setItem(KEY, value);
    expect(new ConferenceStore().conferences()).toEqual(CONFERENCES);
  });

  it('does not mutate the in-memory list if persistence fails', () => {
    const store = new ConferenceStore();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Unavailable'); });
    expect(() => store.save(valid)).toThrow('Unable to save the conference');
    expect(store.conferences()).toEqual(CONFERENCES);
  });
});
