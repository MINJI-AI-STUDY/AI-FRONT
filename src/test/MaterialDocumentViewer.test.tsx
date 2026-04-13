import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MaterialDocumentViewer } from '../components/MaterialDocumentViewer'

describe('MaterialDocumentViewer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
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

  it('문서 뷰어는 단일 페이지 네비게이션만 제공한다', async () => {
    const { container } = render(<MaterialDocumentViewer materialId="m-1" token="t-1" />)

    await screen.findByRole('button', { name: '이전 페이지' })
    expect(screen.queryByText('두쪽보기 우선')).not.toBeInTheDocument()
    expect(screen.queryByText('한쪽보기')).not.toBeInTheDocument()
    expect(screen.getByText('1 페이지')).toBeInTheDocument()
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('페이지 이동 버튼은 한 페이지씩 이동한다', async () => {
    const { rerender } = render(<MaterialDocumentViewer materialId="m-2" token="t-2" />)
    await screen.findByText('1 페이지')

    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
    await waitFor(() => {
      expect(screen.getByText('2 페이지')).toBeInTheDocument()
    })

    rerender(<MaterialDocumentViewer materialId="m-2" token="t-2" />)
    await waitFor(() => {
      expect(screen.getByText('1 페이지')).toBeInTheDocument()
    })
  })
})
