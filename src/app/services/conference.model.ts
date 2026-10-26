export interface Conference {
  id: number;
  name: string;
  date: string;
  place: string;
}

export type ConferenceInput = Omit<Conference, 'id'>;
