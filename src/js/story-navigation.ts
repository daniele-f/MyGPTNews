export type StoryDirection = 'previous' | 'next';

export function storyNavigationTarget(index: number, total: number, direction: StoryDirection) {
  const target = index + (direction === 'previous' ? -1 : 1);
  if (target < 0 || target >= total) return null;
  const focus = direction === 'previous' ? (target > 0 ? 'previous' : 'next') : (target < total - 1 ? 'next' : 'previous');
  return { index: target, focus } as const;
}
