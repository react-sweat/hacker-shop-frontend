import React, { useState } from 'react';

type RegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
};

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, apiBaseUrl }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('SECURITY_BREACH: PASSWORDS_DO_NOT_MATCH');
      return;
    }

    if (formData.password.length < 8) {
      setError('INSUFFICIENT_COMPLEXITY: PASSWORD_TOO_SHORT');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `REGISTRATION_FAILURE: STATUS ${res.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNIDENTIFIED_NETWORK_EXCEPTION');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        style={{ transform: 'translateZ(0)' }} 
        onClick={() => !isLoading && onClose()}
      ></div>
      <div className="relative w-full max-w-md bg-hacker-bg border-2 border-hacker-glow p-8 shadow-[0_0_50px_var(--color-hacker-glow)]">
        {success ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl text-emerald-500 animate-bounce">✓</div>
            <h2 className="text-2xl font-bold glow-text">ENTITY_REGISTERED</h2>
            <p className="opacity-70 font-mono uppercase">ACCESS_CREDENTIALS_STORED_IN_MAINFRAME</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center border-b border-hacker-glow pb-2 mb-4">
              <h2 className="text-xl font-bold glow-text uppercase tracking-widest">New_Entity_Registration</h2>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-red-600 hover:glow-text font-bold"
                disabled={isLoading}
              >
                [X]
              </button>
            </div>

            <div className="space-y-4">
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
                  placeholder="HACKER_1337"
                  value={formData.username}
                  onChange={e => {
                    setError(null);
                    setFormData({ ...formData, username: e.target.value.toLowerCase() }); 
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase opacity-70">COMMS_CHANNEL (EMAIL)</label>
                <input
                  required
                  type="email"
                  className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
                  placeholder="NEO@MATRIX.NET"
                  value={formData.email}
                  onChange={e => {
                    setError(null);
                    setFormData({ ...formData, email: e.target.value });
                  }}
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
                  minLength={8}
                  value={formData.password}
                  onChange={e => {
                    setError(null);
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase opacity-70">VERIFY_ACCESS_KEY</label>
                <input
                  required
                  type="password"
                  className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
                  placeholder="********"
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={e => {
                    setError(null);
                    setFormData({ ...formData, confirmPassword: e.target.value });
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 flex justify-center items-center border-2 border-hacker-glow text-hacker-green font-bold uppercase tracking-[4px] hover:bg-hacker-glow hover:text-hacker-bg hover:shadow-[0_0_30px_var(--color-hacker-glow)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-hacker-green border-t-transparent rounded-full animate-spin"></div>
                    INJECTING_PAYLOAD...
                  </>
                ) : (
                  'INITIALIZE_REGISTRATION'
                )}
              </button>
            </div>
            <p className="text-[9px] text-center opacity-30 font-mono italic uppercase">
              By registering, you agree to the shadow protocols
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
