export type StoryDirection = 'previous' | 'next';

export function storyDirectionForKey(key: string): StoryDirection | null {
  if (key === 'ArrowLeft') return 'previous';
  if (key === 'ArrowRight') return 'next';
  return null;
}

export function storyStageScrollAmountForKey(key: string) {
  if (key === 'ArrowUp') return -48;
  if (key === 'ArrowDown') return 48;
  return 0;
}

export function isEditableTarget(target: EventTarget | null) {
  const element = target as { closest?: (selector: string) => unknown; matches?: (selector: string) => boolean } | null;
  const selector = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
  return Boolean(element?.closest?.(selector) || element?.matches?.(selector));
}

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

export type StorySwipePreview = {
  onDrag?: (deltaX: number) => void;
  onRelease?: (deltaX: number, direction: StoryDirection | null) => void;
  onCancel?: () => void;
};

export function bindStorySwipe(
  stage: HTMLElement,
  navigate: (direction: StoryDirection) => void,
  mobile: Pick<MediaQueryList, 'matches'>,
  preview: StorySwipePreview = {}
) {
  let start: { x: number; y: number; id: number; horizontal: boolean } | null = null;
  const cancel = () => {
    if (start?.horizontal) preview.onCancel?.();
    start = null;
  };
  stage.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || !mobile.matches) { cancel(); return; }
    const touch = event.touches[0];
    start = { x: touch.clientX, y: touch.clientY, id: touch.identifier, horizontal: false };
  }, { passive: true });
  stage.addEventListener('touchmove', event => {
    if (!start) return;
    const touch = event.touches[0];
    if (!mobile.matches || event.touches.length !== 1 || touch.identifier !== start.id) {
      cancel();
      return;
    }
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (!start.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { cancel(); return; }
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) start.horizontal = true;
    }
    if (start.horizontal) {
      event.preventDefault();
      preview.onDrag?.(dx);
    }
  }, { passive: false });
  stage.addEventListener('touchend', event => {
    const origin = start;
    start = null;
    if (!origin || !mobile.matches || event.touches.length) {
      if (origin?.horizontal) preview.onCancel?.();
      return;
    }
    const touch = Array.from(event.changedTouches).find(touch => touch.identifier === origin.id);
    if (!touch) { if (origin.horizontal) preview.onCancel?.(); return; }
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    const direction = origin.horizontal && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5
      ? (dx < 0 ? 'next' : 'previous') : null;
    if (direction) event.preventDefault();
    if (origin.horizontal) preview.onRelease?.(dx, direction);
    if (direction && !preview.onRelease) navigate(direction);
  }, { passive: false });
  stage.addEventListener('touchcancel', cancel, { passive: true });
}
