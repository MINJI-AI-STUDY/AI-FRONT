import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MaterialDocumentViewer } from '../components/MaterialDocumentViewer'

let mockedDefaultPageDisplayMode: 'single' | 'spread' = 'spread'

vi.mock('../hooks/useWorkspaceShell', () => ({
  useWorkspaceShell: () => ({
    defaultPageDisplayMode: mockedDefaultPageDisplayMode,
  }),
}))

describe('MaterialDocumentViewer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    mockedDefaultPageDisplayMode = 'spread'

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['%PDF-test%'], { type: 'application/pdf' }),
      }),
    )

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-document-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  it('좁은 뷰포트(single 기본값)에서는 spread 선택이 비활성화되고 단일 프레임만 렌더링된다', async () => {
    mockedDefaultPageDisplayMode = 'single'
    const { container } = render(<MaterialDocumentViewer materialId="m-1" token="t-1" />)

    const spreadButton = await screen.findByRole('button', { name: '두쪽보기 우선' })
    const singleButton = screen.getByRole('button', { name: '한쪽보기' })

    expect(spreadButton).toBeDisabled()
    expect(singleButton).toHaveClass('active')
    expect(screen.getByText('1 페이지')).toBeInTheDocument()
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('single 강제 구간을 지나면 사용자 선택을 초기화하고 spread 기본값으로 복귀한다', async () => {
    const { rerender } = render(<MaterialDocumentViewer materialId="m-2" token="t-2" />)

    await screen.findByRole('button', { name: '두쪽보기 우선' })
    fireEvent.click(screen.getByRole('button', { name: '한쪽보기' }))
    expect(screen.getByText('1 페이지')).toBeInTheDocument()

    mockedDefaultPageDisplayMode = 'single'
    rerender(<MaterialDocumentViewer materialId="m-2" token="t-2" />)
    expect(screen.getByRole('button', { name: '두쪽보기 우선' })).toBeDisabled()

    mockedDefaultPageDisplayMode = 'spread'
    rerender(<MaterialDocumentViewer materialId="m-2" token="t-2" />)

    await waitFor(() => {
      expect(screen.getByText('1-2 페이지')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '두쪽보기 우선' })).toHaveClass('active')
  })
})
