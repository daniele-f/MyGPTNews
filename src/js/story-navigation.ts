export type StoryDirection = 'previous' | 'next';

export function initialStoryIndex(stories: any[], storyId: string | null) {
  const savedIndex = stories.findIndex(story => story.id === storyId);
  if (savedIndex >= 0) return savedIndex;
  const featuredIndex = stories.findIndex(story => story.featured);
  return featuredIndex >= 0 ? featuredIndex : 0;
}

export function storyNavigationTarget(index: number, total: number, direction: StoryDirection) {
  const target = index + (direction === 'previous' ? -1 : 1);
  if (target < 0 || target >= total) return null;
  const focus = direction === 'previous' ? (target > 0 ? 'previous' : 'next') : (target < total - 1 ? 'next' : 'previous');
  return { index: target, focus } as const;
}
