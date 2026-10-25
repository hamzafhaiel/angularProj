export interface Conference {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  place: string;
  maxParticipants: number;
  nbParticipants: number;
}

export type ConferenceDraft = Omit<Conference, 'id'>;
