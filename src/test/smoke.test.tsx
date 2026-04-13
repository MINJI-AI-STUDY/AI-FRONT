import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

const SimpleComponent = () => <div>Hello Test</div>

describe('smoke', () => {
  it('renders without crashing', () => {
    render(<SimpleComponent />)
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })
})