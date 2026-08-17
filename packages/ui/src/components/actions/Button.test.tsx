import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:text-primary')

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('underline-offset-4')
  })

  it('gives ghost a visible hover that does not depend on an unpainted surface', () => {
    // Regression: ghost was `hover:text-accent-foreground` with no hover background.
    // accent-foreground is meant to sit on an accent surface, so wherever it nears the
    // page background (Volt Dark has both at #000000) the button vanished under the
    // cursor. Any future hover treatment must carry its own visible affordance.
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('hover:border-primary')
    expect(button).toHaveClass('hover:text-primary')
    // A hover text colour that only reads against a surface the variant never paints.
    expect(button).not.toHaveClass('hover:text-accent-foreground')
    // Reserved at rest so gaining the hover border never shifts the box.
    expect(button).toHaveClass('border', 'border-transparent')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Styled</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
