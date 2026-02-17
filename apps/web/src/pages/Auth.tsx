import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { SignUpForm } from '../components/auth/SignUpForm'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'

type AuthView = 'signup' | 'login' | 'verification-pending'

export function Auth() {
  const [view, setView] = useState<AuthView>('signup')
  const [pendingEmail, setPendingEmail] = useState<string>('')
  const [verificationSentAt, setVerificationSentAt] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [showEmulatorHelp, setShowEmulatorHelp] = useState(true)
  const { resendVerification } = useAuth()

  const isDevelopment = import.meta.env.DEV

  // Auto-dismiss success/resend messages
  useEffect(() => {
    if (successMessage || resendMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setResendMessage(null)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [successMessage, resendMessage])

  const handleSignUpSuccess = (email: string) => {
    console.log('👀 [Auth] Showing verification-pending view for:', email)
    if (isDevelopment) {
      console.log('⚠️ [Auth] Development mode - using Firebase Emulator')
    }

    setPendingEmail(email)
    const now = new Date()
    setVerificationSentAt(now.toLocaleTimeString())
    setView('verification-pending')

    console.log('✅ [Auth] View switched to: verification-pending')
  }

  const handleViewToggle = (newView: AuthView) => {
    setView(newView)
    setSuccessMessage(null)
    setResendMessage(null)
    setFormKey(prev => prev + 1)
  }

  const handleResendVerification = async (password: string) => {
    setResending(true)
    setResendMessage(null)

    try {
      await resendVerification(pendingEmail, password)
      const now = new Date()
      setVerificationSentAt(now.toLocaleTimeString())
      setResendMessage('✅ Verification email resent! Check your inbox.')
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const handleBackToSignIn = () => {
    setView('login')
    setPendingEmail('')
    setFormKey(prev => prev + 1)
  }

  const openEmulatorUI = () => {
    window.open('http://localhost:4000', '_blank')
  }

  // Verification Pending View
  if (view === 'verification-pending') {
    const [passwordForResend, setPasswordForResend] = useState('')

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FitSprint</h1>
            <p className="text-gray-600">Verify your email to continue</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* Emulator Warning Banner - Development Only */}
            {isDevelopment && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-amber-900">
                        ⚠️ Development Mode - Using Firebase Emulator
                      </h3>
                      <button
                        onClick={() => setShowEmulatorHelp(!showEmulatorHelp)}
                        className="text-amber-700 hover:text-amber-900 text-sm font-medium"
                      >
                        {showEmulatorHelp ? 'Hide' : 'Show'} instructions
                      </button>
                    </div>

                    {showEmulatorHelp && (
                      <div className="space-y-3">
                        <p className="text-sm text-amber-800">
                          Verification emails won't arrive in your real inbox. Follow these steps to
                          verify:
                        </p>

                        <div className="bg-white rounded-lg p-3 space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs">
                              1
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">Open Firebase Emulator UI</p>
                              <button
                                onClick={openEmulatorUI}
                                className="text-violet-600 hover:text-violet-700 underline mt-1"
                              >
                                Click here to open http://localhost:4000
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs">
                              2
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">Go to Authentication tab</p>
                              <p className="text-gray-600 text-xs">
                                Find your email in the users list
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs">
                              3
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                Toggle "Email Verified" to TRUE
                              </p>
                              <p className="text-gray-600 text-xs">
                                Or check the email content for verification link
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs">
                              4
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                Return here and click "Back to Sign In"
                              </p>
                              <p className="text-gray-600 text-xs">
                                Then log in with your credentials
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-amber-700 italic">
                          💡 In production, you'll receive a real email at your inbox
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Icon & Message */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-green-600"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M2 7l10 7 10-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  {/* Check mark overlay */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-4 border-white">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Email Sent! ✉️</h2>

              <div className="bg-violet-50 border-2 border-violet-200 rounded-lg p-4 mb-2">
                <p className="text-sm text-gray-700 mb-1">Sent to:</p>
                <p className="text-base font-semibold text-violet-700 break-all">{pendingEmail}</p>
                {verificationSentAt && (
                  <p className="text-xs text-gray-500 mt-2">at {verificationSentAt}</p>
                )}
              </div>
            </div>

            {/* What to do next (Production instructions) */}
            {!isDevelopment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">What to do next:</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs">
                      1
                    </span>
                    <span>Check your email inbox for our verification message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs">
                      2
                    </span>
                    <span>Click the verification link in the email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs">
                      3
                    </span>
                    <span>Return here and click "Back to Sign In"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs">
                      4
                    </span>
                    <span>Log in with your credentials</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Resend Message */}
            {resendMessage && (
              <div
                className={`p-3 rounded-lg text-sm text-center ${
                  resendMessage.includes('✅')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {resendMessage}
              </div>
            )}

            {/* Resend Verification Section */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 text-center mb-3">Didn't receive the email?</p>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Enter your password to resend"
                  value={passwordForResend}
                  onChange={e => setPasswordForResend(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none text-sm"
                  disabled={resending}
                />
                <button
                  onClick={() => handleResendVerification(passwordForResend)}
                  disabled={!passwordForResend || resending}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </div>

            {/* Back to Sign In Button */}
            <button
              onClick={handleBackToSignIn}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Back to Sign In
            </button>
          </div>

          {/* Footer Help Text */}
          <p className="text-center text-xs text-gray-500 mt-4">
            {isDevelopment
              ? 'Development mode - Follow the emulator instructions above'
              : "Check your spam folder if you don't see the email"}
          </p>
        </div>
      </div>
    )
  }

  // Regular Auth View (Sign Up / Sign In)
  return (
    <div className="min-h-screen bg-violet-50/30 flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm mb-4">
            <Zap className="w-7 h-7 text-violet-600 fill-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FitSprint</h1>
          <p className="text-gray-500 font-medium">
            {view === 'signup' ? 'Start your fitness journey' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {successMessage && view === 'login' && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 relative animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pill Toggle */}
          <div className="flex bg-gray-50 p-1.5 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => handleViewToggle('signup')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                view === 'signup'
                  ? 'bg-violet-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => handleViewToggle('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                view === 'login'
                  ? 'bg-violet-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form Content */}
          <div className="mb-8">
            {view === 'signup' ? (
              <SignUpForm key={`signup-${formKey}`} onSuccess={handleSignUpSuccess} />
            ) : (
              <LoginForm key={`login-${formKey}`} />
            )}
          </div>

          {/* Toggle Link (Bottom of card) */}
          <div className="text-center">
            {view === 'signup' ? (
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleViewToggle('login')}
                  className="text-violet-600 hover:text-violet-700 font-bold transition hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleViewToggle('signup')}
                  className="text-violet-600 hover:text-violet-700 font-bold transition hover:underline"
                >
                  Sign up here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-400 font-medium bg-opacity-0 backdrop-blur-sm">
                or continue with
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition bg-white shadow-sm">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 opacity-50 grayscale hover:grayscale-0 transition"
              />
            </button>
            <button className="flex-1 flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition bg-white shadow-sm">
              <img
                src="https://www.svgrepo.com/show/511330/apple-173.svg"
                alt="Apple"
                className="w-5 h-5 opacity-50 grayscale hover:grayscale-0 transition"
              />
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 italic">
            Every rep counts. Every step matters.
          </p>
        </div>
      </div>
    </div>
  )
}
