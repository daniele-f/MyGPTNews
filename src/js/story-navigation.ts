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

export function bindStorySwipe(stage: HTMLElement, navigate: (direction: StoryDirection) => void, mobile: Pick<MediaQueryList, 'matches'>) {
  let start: { x: number; y: number; id: number } | null = null;
  stage.addEventListener('touchstart', event => {
    const touch = event.touches[0];
    start = mobile.matches && event.touches.length === 1
      ? { x: touch.clientX, y: touch.clientY, id: touch.identifier }
      : null;
  }, { passive: true });
  stage.addEventListener('touchmove', event => {
    if (!start) return;
    const touch = event.touches[0];
    if (!mobile.matches || event.touches.length !== 1 || touch.identifier !== start.id) {
      start = null;
      return;
    }
    const x = Math.abs(touch.clientX - start.x);
    const y = Math.abs(touch.clientY - start.y);
    if (y > 10 && y >= x) start = null;
    else if (x > 10 && x > y * 1.5) event.preventDefault();
  }, { passive: false });
  stage.addEventListener('touchend', event => {
    const origin = start;
    start = null;
    if (!origin || !mobile.matches || event.touches.length) return;
    const touch = Array.from(event.changedTouches).find(touch => touch.identifier === origin.id);
    if (!touch) return;
    const x = touch.clientX - origin.x;
    const y = touch.clientY - origin.y;
    if (Math.abs(x) < 50 || Math.abs(x) <= Math.abs(y) * 1.5) return;
    // A completed swipe must not also open a link under the finger.
    event.preventDefault();
    navigate(x < 0 ? 'next' : 'previous');
  }, { passive: false });
  stage.addEventListener('touchcancel', () => { start = null; }, { passive: true });
}
