/**
 * Button component - reusable button
 * File: frontend/src/components/Common/Button.tsx
 */

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button'
}: ButtonProps) {
  /**
   * Reusable button component with variants
   */

  // TODO: Apply styles based on variant
  // TODO: Handle disabled state
  // TODO: Apply Tailwind classes

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant}`}
    >
      {children}
    </button>
  )
}
