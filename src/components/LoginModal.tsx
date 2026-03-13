import React, { useState } from 'react';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  onLoginSuccess: (user: any, token: string) => void;
};

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, apiBaseUrl, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `AUTH_FAILURE: STATUS ${res.status}`);
      }
      
      const data = await res.json();
      
      onLoginSuccess(data.user || { username: formData.username }, data.token || 'simulated-token');
      
      setTimeout(() => {
        onClose();
        setFormData({ username: '', password: '' });
      }, 500);

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-hacker-glow pb-2 mb-4">
            <h2 className="text-xl font-bold glow-text uppercase tracking-widest">Entity_Authentication</h2>
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
              <label className="text-[10px] uppercase opacity-70">ACCESS_KEY (PASSWORD)</label>
              <input
                required
                type="password"
                className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
                placeholder="********"
                value={formData.password}
                onChange={e => {
                  setError(null);
                  setFormData({ ...formData, password: e.target.value });
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
                  VALIDATING_CREDENTIALS...
                </>
              ) : (
                'ESTABLISH_SESSION'
              )}
            </button>
          </div>
          <p className="text-[9px] text-center opacity-30 font-mono italic uppercase">
            Unauthorized access will be tracked and reported
          </p>
        </form>
      </div>
    </div>
  );
};
