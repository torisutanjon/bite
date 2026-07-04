import '@testing-library/jest-dom'

// scrollIntoView is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// ResizeObserver is not implemented in jsdom (used by Radix UI Checkbox, Dialog, etc.)
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
