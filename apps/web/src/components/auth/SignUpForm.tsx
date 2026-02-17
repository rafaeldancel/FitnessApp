import { useState } from 'react'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

// Simplified inline validation schema - only email and password
const BaseSignUpSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
})

const SignUpSchema = BaseSignUpSchema.refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignUpInput = z.infer<typeof SignUpSchema>

interface SignUpFormProps {
  onSuccess?: (email: string) => void
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

type SignUpStage = 'idle' | 'creating' | 'sending' | 'complete'

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState<SignUpInput>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [signUpStage, setSignUpStage] = useState<SignUpStage>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isSubmitting = signUpStage !== 'idle'

  const validateField = (name: keyof SignUpInput, value: unknown) => {
    try {
      const pickMask = { [name]: true } as Partial<Record<keyof SignUpInput, true>>
      BaseSignUpSchema.pick(pickMask).parse({ [name]: value })
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
    validateField(name as keyof SignUpInput, value)
  }

  const getStageMessage = () => {
    switch (signUpStage) {
      case 'creating':
        return 'Creating your account...'
      case 'sending':
        return 'Sending verification email...'
      case 'complete':
        return 'Almost done...'
      default:
        return 'Sign Up'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Validate all fields
    try {
      SignUpSchema.parse(formData)
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

    // Submit form with progress stages
    try {
      // Stage 1: Creating account
      setSignUpStage('creating')
      await new Promise(resolve => setTimeout(resolve, 500)) // Show stage for 500ms

      // Stage 2: Sending email (actual signup happens here)
      setSignUpStage('sending')
      await signUp(formData.email, formData.password)
      await new Promise(resolve => setTimeout(resolve, 500)) // Show stage for 500ms

      // Stage 3: Complete
      setSignUpStage('complete')
      await new Promise(resolve => setTimeout(resolve, 300))

      console.log('📧 [SignUpForm] Signup successful, switching to verification view')
      onSuccess?.(formData.email)
    } catch (err) {
      console.error('❌ [SignUpForm] Signup failed:', err)
      setSubmitError(err instanceof Error ? err.message : 'Failed to sign up')
      setSignUpStage('idle')
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none transition ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none transition ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="At least 6 characters"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none transition ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Re-enter your password"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
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
        {getStageMessage()}
      </button>
    </form>
  )
}
