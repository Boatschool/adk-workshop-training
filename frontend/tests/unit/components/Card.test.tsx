/**
 * Card Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@components/common/Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    render(<Card data-testid="card">Default</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('shadow')
  })

  it('renders with elevated variant', () => {
    render(<Card variant="elevated" data-testid="card">Elevated</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('shadow-lg')
  })

  it('renders with outlined variant', () => {
    render(<Card variant="outlined" data-testid="card">Outlined</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('border')
  })

  it('renders with different padding sizes', () => {
    const { rerender } = render(<Card padding="none" data-testid="card">None</Card>)
    expect(screen.getByTestId('card')).not.toHaveClass('p-4', 'p-6', 'p-8')

    rerender(<Card padding="sm" data-testid="card">Small</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-4')

    rerender(<Card padding="md" data-testid="card">Medium</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-6')

    rerender(<Card padding="lg" data-testid="card">Large</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-8')
  })

  it('applies custom className', () => {
    render(<Card className="custom-card" data-testid="card">Custom</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom-card')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Card ref={ref}>Ref</Card>)
    expect(ref).toHaveBeenCalled()
  })
})

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)
    expect(screen.getByText('Header')).toHaveClass('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title')
  })

  it('applies styling', () => {
    render(<CardTitle>Styled Title</CardTitle>)
    expect(screen.getByRole('heading')).toHaveClass('text-lg', 'font-semibold')
  })
})

describe('CardDescription', () => {
  it('renders paragraph text', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('applies styling', () => {
    render(<CardDescription>Styled description</CardDescription>)
    expect(screen.getByText('Styled description')).toHaveClass('text-sm', 'text-gray-500')
  })
})

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content body</CardContent>)
    expect(screen.getByText('Content body')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies flex layout', () => {
    render(<CardFooter>Flex footer</CardFooter>)
    expect(screen.getByText('Flex footer')).toHaveClass('flex', 'items-center')
  })
})

describe('Card composition', () => {
  it('renders full card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    )

    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByText('Footer actions')).toBeInTheDocument()
  })
})
