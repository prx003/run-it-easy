export type AccountType = 'personal' | 'business';
export type CreateKind = 'Post' | 'Reel' | 'Story' | 'Tweet' | 'News' | 'Event' | 'Ticket';
export function createOptions(type: AccountType): CreateKind[] {
  return type === 'business'
    ? ['Post', 'Reel', 'Story', 'Tweet', 'News', 'Event', 'Ticket']
    : ['Post', 'Reel', 'Story', 'Tweet'];
}
