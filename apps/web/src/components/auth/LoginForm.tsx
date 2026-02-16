import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'

// Inline validation schema
const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof LoginSchema>

interface LoginFormProps {
  onSuccess?: () => void
}

interface FormErrors {
  email?: string
  password?: string
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn } = useAuth()
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateField = (name: keyof LoginInput, value: string) => {
    try {
      const pickMask = { [name]: true } as Partial<Record<keyof LoginInput, true>>
      LoginSchema.pick(pickMask).parse({ [name]: value })
      setErrors(prev => ({ ...prev, [name]: undefined }))
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        if (err.errors?.[0]) {
          setErrors(prev => ({ ...prev, [name]: err.errors[0].message }))
        }
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    setSubmitError(null)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    validateField(name as keyof LoginInput, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Validate all fields
    try {
      LoginSchema.parse(formData)
      setErrors({})
    } catch (err: unknown) {
      const fieldErrors: FormErrors = {}
      if (err instanceof z.ZodError) {
        err.errors.forEach(error => {
          const field = error.path[0] as keyof FormErrors
          fieldErrors[field] = error.message
        })
      }
      setErrors(fieldErrors)
      return
    }

    // Submit form
    setIsSubmitting(true)
    try {
      await signIn(formData.email, formData.password)
      onSuccess?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="login-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none transition ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="login-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none transition ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Your password"
          disabled={isSubmitting}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
