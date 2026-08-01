import '@testing-library/jest-dom'

// Specs that opt into `@jest-environment node` (the service client's browser
// guard needs a world where `window` is absent) share this setup file but have
// no window to patch, so everything jsdom-specific is guarded.
if (typeof window !== 'undefined') {
  // scrollIntoView is not implemented in jsdom
  window.HTMLElement.prototype.scrollIntoView = jest.fn()

  // ResizeObserver is not implemented in jsdom (used by Radix UI Checkbox, Dialog, etc.)
  class MockResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
}
