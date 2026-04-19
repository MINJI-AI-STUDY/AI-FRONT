import '@testing-library/jest-dom'

const originalConsoleError = console.error

if ('happyDOM' in window) {
  const happyDomWindow = window as Window & {
    happyDOM?: { settings?: { disableIframePageLoading?: boolean } }
  }
  if (happyDomWindow.happyDOM?.settings) {
    happyDomWindow.happyDOM.settings.disableIframePageLoading = true
  }
}

console.error = (...args: unknown[]) => {
  const first = args[0]
  if (
    first instanceof Error &&
    first.name === 'NotSupportedError' &&
    first.message.includes('Iframe page loading is disabled.')
  ) {
    return
  }
  if (
    typeof first === 'string' &&
    first.includes('Iframe page loading is disabled.')
  ) {
    return
  }
  originalConsoleError(...args)
}
