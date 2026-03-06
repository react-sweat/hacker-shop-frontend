import { useEffect, useState } from 'react'
import Snowfall from 'react-snowfall'

type Product = {
  id: string | number
  name: string
  description?: string
  price: number
  imageUrl?: string
}

type CartItem = Product & {
  quantity: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [theme, setTheme] = useState<'dark' | 'light' | 'winter'>(() => {
    return (localStorage.getItem('hacker-theme') as 'dark' | 'light' | 'winter') || 'dark'
  })

  const [paymentData, setPaymentData] = useState({
    account: '',
    holder: '',
    key: '',
    expiry: ''
  })

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const toggleTheme = () => {
    let newTheme: 'dark' | 'light' | 'winter'
    if (theme === 'dark') newTheme = 'light'
    else if (theme === 'light') newTheme = 'winter'
    else newTheme = 'dark'

    setTheme(newTheme)
    localStorage.setItem('hacker-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const decrementItem = (id: CartItem['id']) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: CartItem['id']) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const trimmed = digits.substring(0, 16)
    const blocks = trimmed.match(/.{1,4}/g) || []
    return blocks.join(' ')
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 1 && parseInt(digits) > 1) {
      return `0${digits}/`
    }
    if (digits.length >= 2) {
      let month = parseInt(digits.substring(0, 2))
      if (month > 12) month = 12
      if (month === 0) month = 1
      const monthStr = month.toString().padStart(2, '0')
      if (digits.length > 2) {
        return `${monthStr}/${digits.substring(2, 4)}`
      }
      return `${monthStr}/`
    }
    return digits
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    const expiryParts = paymentData.expiry.split('/')
    if (expiryParts.length === 2) {
      const year = parseInt(expiryParts[1])
      if (isNaN(year) || year < 26) {
        setValidationError('INVALID_EXPIRY_YEAR: MINIMUM_REQUIRED_26')
        return
      }
    } else {
      setValidationError('INVALID_EXPIRY_FORMAT')
      return
    }
    if (paymentData.account.replace(/\s/g, '').length < 16) {
      setValidationError('INVALID_ACCOUNT_ID: INCOMPLETE_SEQUENCE')
      return
    }
    setIsProcessingPayment(true)
    setTimeout(() => {
      setIsProcessingPayment(false)
      setPaymentSuccess(true)
      setTimeout(() => {
        setCart([])
        setPaymentSuccess(false)
        setIsPaymentModalOpen(false)
        setIsCartOpen(false)
        setPaymentData({ account: '', holder: '', key: '', expiry: '' })
      }, 2000)
    }, 3000)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE_URL}/products`)
        if (!res.ok) {
          throw new Error(`INTERNAL_QUERY_FAILURE: ${res.status}`)
        }
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'UNIDENTIFIED_NETWORK_EXCEPTION'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    void loadProducts()
  }, [])

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-[1400px] mx-auto animate-flicker relative">
      {theme === 'winter' && <Snowfall color="#00ffff" snowflakeCount={150} style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9996 }} />}

      <div className="scanline-effect"></div>
      <div className="hacker-noise"></div>
      <div className="crt-overlay"></div>

      <header className="border-b-2 border-hacker-green pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter glow-text animate-glitch uppercase">{`{ HACKER_SHOP }`}</h1>
          <p className="text-xs opacity-80 mt-1">SECURE_INVENTORY_SYSTEM // v0.4.2</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="border border-hacker-green px-3 py-1 text-[10px] uppercase tracking-wider hover:bg-hacker-green hover:text-hacker-bg transition-all font-mono"
            >
              MODE: {theme.toUpperCase()}
            </button>
            <p className="text-[10px] opacity-70 font-mono">USER@LOCAL_CLIENT:~$</p>
          </div>
          <button
            className="border border-hacker-green px-6 py-2 text-hacker-green uppercase tracking-[2px] transition-all hover:bg-hacker-green hover:text-hacker-bg hover:shadow-[0_0_20px_var(--color-hacker-green)] active:scale-95 flex items-center gap-2"
            onClick={() => setIsCartOpen(true)}
          >
            DATA_BUFFER [{cartCount.toString().padStart(2, '0')}]
          </button>
        </div>
      </header>

      <main className="flex-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-64 h-2 bg-hacker-terminal/30 hacker-border overflow-hidden">
              <div className="h-full bg-hacker-green animate-loading"></div>
            </div>
            <p className="glow-text animate-pulse">ESTABLISHING_LINK...</p>
          </div>
        ) : error ? (
          <div className="p-8 hacker-border bg-red-950/20 text-red-500">
            <h2 className="text-xl font-bold mb-2">!! SYSTEM_ERROR !!</h2>
            <p>{error}</p>
            <button
              className="mt-4 border border-red-500 text-red-500 px-4 py-1 hover:bg-red-500 hover:text-black transition-colors"
              onClick={() => window.location.reload()}
            >
              REBOOT_SYSTEM
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
            {products.map((product) => (
              <article key={product.id} className="hacker-border bg-[rgba(var(--color-hacker-bg-rgb),0.4)] p-6 flex flex-col gap-4 relative transition-transform hover:-translate-y-1 hover:bg-[rgba(var(--color-hacker-bg-rgb),0.6)] group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-hacker-green scale-x-0 transition-transform group-hover:scale-x-100"></div>
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold glow-text leading-tight">{product.name}</h2>
                  <span className="text-[10px] opacity-50 font-mono">ID: {product.id}</span>
                </div>
                {product.description && (
                  <p className="text-sm opacity-80 leading-relaxed h-12 overflow-hidden italic">
                    {`> ${product.description}`}
                  </p>
                )}
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-2xl font-bold text-hacker-green shadow-[0_0_10px_rgba(var(--color-hacker-green-rgb),0.5)] glow-text">
                    {product.price.toFixed(2)} zł
                  </span>
                  <button
                    className="border border-hacker-green px-4 py-1 text-sm text-hacker-green uppercase tracking-wider transition-all hover:bg-hacker-green hover:text-hacker-bg hover:shadow-[0_0_15px_var(--color-hacker-green)]"
                    onClick={() => addToCart(product)}
                  >
                    TRANSFER
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-1 opacity-20">
                  <div className="w-1 h-1 bg-hacker-green rounded-full animate-ping"></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <div className={`fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-hacker-bg border-l-2 border-hacker-green p-8 flex flex-col gap-6 z-[1000] transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold glow-text">BUFFER_CONTENTS</h2>
          <button
            className="text-red-500 hover:glow-text text-xl font-bold"
            onClick={() => setIsCartOpen(false)}
          >
            [X]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
          {cart.length === 0 ? (
            <p className="opacity-50 italic">BUFFER_IS_EMPTY</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="border-b border-hacker-terminal/50 py-4 flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{item.name}</p>
                  <p className="text-xs opacity-60">{item.price.toFixed(2)} zł</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-hacker-green">
                    <button className="w-6 h-6 flex items-center justify-center hover:bg-hacker-green hover:text-hacker-bg border-r border-hacker-green" onClick={() => decrementItem(item.id)}>-</button>
                    <span className="px-2 text-xs font-mono">{item.quantity}</span>
                    <button className="w-6 h-6 flex items-center justify-center hover:bg-hacker-green hover:text-hacker-bg border-l border-hacker-green" onClick={() => addToCart(item)}>+</button>
                  </div>
                  <button
                    className="text-red-500 text-[10px] hover:glow-text ml-2 uppercase"
                    onClick={() => removeItem(item.id)}
                  >
                    DEL
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto border-t border-hacker-terminal pt-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="opacity-70 text-sm">TOTAL_RESOURCES:</span>
            <span className="text-2xl font-bold glow-text">{cartTotal.toFixed(2)} zł</span>
          </div>
          <button
            className="w-full py-4 border border-hacker-green bg-transparent text-hacker-green text-xl font-bold uppercase tracking-[4px] shadow-[0_0_10px_var(--color-hacker-glow)] transition-all hover:bg-hacker-green hover:text-hacker-bg hover:shadow-[0_0_30px_var(--color-hacker-green)] disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98]"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            EXECUTE_TRANSFER
          </button>
        </div>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => !isProcessingPayment && setIsPaymentModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-hacker-bg border-2 border-hacker-green p-8 shadow-[0_0_50px_var(--color-hacker-glow)]">
            {paymentSuccess ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl text-hacker-green animate-bounce">✓</div>
                <h2 className="text-2xl font-bold glow-text">TRANSFER_AUTHORIZED</h2>
                <p className="opacity-70 font-mono">RESOURCES_DEPOSITED_TO_REMOTE_NODE</p>
              </div>
            ) : isProcessingPayment ? (
              <div className="text-center py-12 space-y-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 border-4 border-hacker-green border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold glow-text animate-pulse">ENCRYPTING_TRANSACTION_LOAD...</h2>
                  <p className="text-[10px] font-mono opacity-50">BYPASSING_PAYMENT_GATEWAY_V4.2</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="flex justify-between items-center border-b border-hacker-green pb-2 mb-4">
                  <h2 className="text-xl font-bold glow-text uppercase tracking-widest">Payment_Details</h2>
                  <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="text-red-500 hover:glow-text font-bold">[X]</button>
                </div>

                <div className="space-y-4">
                  {validationError && (
                    <div className="p-2 border border-red-500 bg-red-950/20 text-red-500 text-[10px] font-mono animate-pulse uppercase">
                      !! {validationError} !!
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase opacity-70">TARGET_ACCOUNT_IBAN</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-hacker-terminal/20 border border-hacker-green/50 p-2 text-hacker-green focus:border-hacker-green focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
                      placeholder="0000 0000 0000 0000"
                      value={paymentData.account}
                      onChange={e => {
                        setValidationError(null)
                        setPaymentData({ ...paymentData, account: formatCardNumber(e.target.value) })
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase opacity-70">ACCOUNT_HOLDER_ALIAS</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-hacker-terminal/20 border border-hacker-green/50 p-2 text-hacker-green focus:border-hacker-green focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm uppercase"
                      placeholder="ANONYMOUS_ENTITY"
                      value={paymentData.holder}
                      onChange={e => {
                        setValidationError(null)
                        setPaymentData({ ...paymentData, holder: e.target.value.toUpperCase() })
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase opacity-70">EXPIRATION (MM/YY)</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-hacker-terminal/20 border border-hacker-green/50 p-2 text-hacker-green focus:border-hacker-green focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
                        placeholder="MM/YY"
                        value={paymentData.expiry}
                        onChange={e => {
                          setValidationError(null)
                          setPaymentData({ ...paymentData, expiry: formatExpiry(e.target.value) })
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase opacity-70">SECURITY_TOKEN</label>
                      <input
                        required
                        type="password"
                        className="w-full bg-hacker-terminal/20 border border-hacker-green/50 p-2 text-hacker-green focus:border-hacker-green focus:outline-none focus:shadow-[0_0_10px_var(--color-hacker-glow)] font-mono text-sm"
                        placeholder="***"
                        maxLength={3}
                        value={paymentData.key}
                        onChange={e => {
                          setValidationError(null)
                          const val = e.target.value.replace(/\D/g, '')
                          setPaymentData({ ...paymentData, key: val })
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="px-2 py-1 bg-hacker-terminal/10 border border-hacker-green/20 text-[9px] font-mono opacity-60 flex justify-between uppercase">
                    <span>TRANSFER_AMOUNT: {cartTotal.toFixed(2)} PLN</span>
                    <span>VERIFICATION_REQUIRED</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 border-2 border-hacker-green text-hacker-green font-bold uppercase tracking-[4px] hover:bg-hacker-green hover:text-hacker-bg hover:shadow-[0_0_30px_var(--color-hacker-green)] transition-all active:scale-[0.98]"
                  >
                    CONFIRM_UPLOAD
                  </button>
                </div>
                <p className="text-[9px] text-center opacity-30 font-mono italic uppercase">
                  End-to-end encryption active // Remote node connection established
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="mt-8 text-[10px] opacity-40 flex justify-between font-mono">
        <p>© 202X ANONYMOUS_HACKER_CORP // ALL_RIGHTS_RESERVED</p>
        <p>TERMINAL_CONNECTION: ENCRYPTED_AES256</p>
      </footer>
    </div>
  )
}

export default App
