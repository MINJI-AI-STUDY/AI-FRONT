import { act, renderHook } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWorkspaceShell } from '../hooks/useWorkspaceShell'

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width') ? window.innerWidth <= 1180 : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

beforeEach(() => {
  setViewport(1366)
})

describe('useWorkspaceShell', () => {
  it('데스크톱 폭에서 인라인 레이아웃과 spread 기본값을 계산한다', () => {
    setViewport(1366)
    const { result } = renderHook(() => useWorkspaceShell())

    expect(result.current.viewportMode).toBe('desktop')
    expect(result.current.isCompactViewport).toBe(false)
    expect(result.current.leftPanelMode).toBe('inline')
    expect(result.current.rightPanelMode).toBe('inline')
    expect(result.current.canRightPanelInline).toBe(true)
    expect(result.current.defaultPageDisplayMode).toBe('spread')
    expect(result.current.leftSidebarOpen).toBe(true)
    expect(result.current.rightPanelOpen).toBe(false)
  })

  it('컴팩트 폭에서 오버레이 모드와 single 기본값으로 폴백한다', () => {
    setViewport(560)
    const { result } = renderHook(() => useWorkspaceShell())

    expect(result.current.viewportMode).toBe('mobile')
    expect(result.current.isCompactViewport).toBe(true)
    expect(result.current.leftPanelMode).toBe('overlay')
    expect(result.current.rightPanelMode).toBe('overlay')
    expect(result.current.canRightPanelInline).toBe(false)
    expect(result.current.defaultPageDisplayMode).toBe('single')
    expect(result.current.leftSidebarOpen).toBe(false)
  })

  it('컴팩트 뷰포트에서 오버레이는 상호 배타적으로 열린다', () => {
    setViewport(900)
    const { result } = renderHook(() => useWorkspaceShell({ initialLeftOpen: true }))

    act(() => {
      result.current.toggleRightPanel(true)
    })
    expect(result.current.rightPanelOpen).toBe(true)
    expect(result.current.leftSidebarOpen).toBe(false)

    act(() => {
      result.current.toggleLeftSidebar(true)
    })
    expect(result.current.leftSidebarOpen).toBe(true)
    expect(result.current.rightPanelOpen).toBe(false)
  })
})
