import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AdminLoginPageProps = {
  apiBaseUrl: string
  onLoginSuccess: (user: any, token: string) => void
}

export function AdminLoginPage({ apiBaseUrl, onLoginSuccess }: AdminLoginPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || `AUTH_FAILURE_STATUS_${res.status}`)
      }

      if (!data?.token || !data?.user) {
        throw new Error('INVALID_AUTH_RESPONSE')
      }

      if (data.user.role !== 'ADMIN') {
        throw new Error('FORBIDDEN_ADMIN_CLEARANCE_REQUIRED')
      }

      onLoginSuccess(data.user, data.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNIDENTIFIED_NETWORK_EXCEPTION')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md hacker-border bg-hacker-bg/40 p-8 shadow-[0_0_50px_var(--color-hacker-glow)]">
        <div className="flex justify-between items-center border-b border-hacker-glow pb-2 mb-6">
          <h2 className="text-xl font-bold glow-text uppercase tracking-widest">Admin_Access_Gateway</h2>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="text-red-600 hover:glow-text font-bold"
            disabled={isLoading}
          >
            [X]
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {error && (
            <div className="p-2 border border-red-600 bg-red-950/10 text-red-600 text-[10px] font-mono animate-pulse uppercase">
              !! {error} !!
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase opacity-70">ALIAS (USERNAME)</label>
            <input
              required
              type="text"
              className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm uppercase"
              placeholder="ADMIN"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase opacity-70">ACCESS_KEY (PASSWORD)</label>
            <input
              required
              type="password"
              className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 flex justify-center items-center border-2 border-red-500 text-red-500 font-bold uppercase tracking-[4px] hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          >
            {isLoading ? 'VALIDATING_CLEARANCE...' : 'ENTER_ADMIN_PANEL'}
          </button>

          <p className="text-[9px] text-center opacity-30 font-mono italic uppercase">
            Unauthorized access will be tracked and reported
          </p>
        </form>
      </div>
    </div>
  )
}

