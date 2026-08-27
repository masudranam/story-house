/**
 * Test environment shims. jsdom has no IntersectionObserver, which Angular's
 * `@defer (on viewport)` needs — without it the story detail spec throws
 * mid-render. The stub never fires, so deferred blocks simply stay in their
 * placeholder state during tests.
 */
class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  // Intentionally inert: deferred blocks stay in their placeholder in tests.
  observe(): void {
    return undefined;
  }
  unobserve(): void {
    return undefined;
  }
  disconnect(): void {
    return undefined;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (!('IntersectionObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: NoopIntersectionObserver,
  });
}
