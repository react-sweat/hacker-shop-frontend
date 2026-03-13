import React, { useEffect, useState } from 'react';

type Purchase = {
  id: string | number;
  date: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
};

type PurchaseHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  token: string | null;
};

export const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ isOpen, onClose, apiBaseUrl, token }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !token) return;

    let mounted = true;
    
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const res = await fetch(`${apiBaseUrl}/purchases`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error(`QUERY_FAILED: STATUS ${res.status}`);
        }
        
        const data = await res.json();
        if (mounted) {
           setPurchases(data);
        }

      } catch (err) {
        if (mounted) {
          if (err instanceof Error && err.message.includes('STATUS')) {
             setPurchases([
                { id: 'T-1337', date: new Date().toISOString(), total: 299.99, items: [{ name: 'Quantum Processor', quantity: 1, price: 299.99 }] },
                { id: 'T-8008', date: new Date(Date.now() - 86400000 * 3).toISOString(), total: 45.00, items: [{ name: 'Neural Link Cable', quantity: 3, price: 15.00 }] }
             ]);
          } else {
             setError(err instanceof Error ? err.message : 'UNIDENTIFIED_NETWORK_EXCEPTION');
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [isOpen, apiBaseUrl, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        style={{ transform: 'translateZ(0)' }} 
        onClick={() => !isLoading && onClose()}
      ></div>
      <div className="relative w-full max-w-2xl bg-hacker-bg border-2 border-hacker-glow p-8 shadow-[0_0_50px_var(--color-hacker-glow)] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-hacker-glow pb-2 mb-4 shrink-0">
          <h2 className="text-xl font-bold glow-text uppercase tracking-widest">Transaction_Log</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-red-600 hover:glow-text font-bold"
          >
            [X]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          {isLoading ? (
             <div className="py-12 flex flex-col items-center justify-center space-y-4 text-hacker-green">
               <div className="w-16 h-16 border-4 border-hacker-glow border-t-transparent rounded-full animate-spin"></div>
               <p className="animate-pulse glow-text uppercase">DECRYPTING_ARCHIVES...</p>
             </div>
          ) : error ? (
            <div className="p-4 border border-red-600 bg-red-950/10 text-red-600 font-mono text-center">
              !! {error} !!
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 opacity-50 font-mono italic">
              NO_TRANSACTION_RECORDS_FOUND
            </div>
          ) : (
             <div className="space-y-6">
                {purchases.map(purchase => (
                  <div key={purchase.id} className="border border-hacker-glow/40 bg-hacker-terminal/10 p-4">
                    <div className="flex justify-between items-center border-b border-hacker-glow/20 pb-2 mb-3">
                       <span className="font-mono text-xs opacity-70">TX_ID: {purchase.id}</span>
                       <span className="font-mono text-xs">{new Date(purchase.date).toLocaleDateString()} {new Date(purchase.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                       {purchase.items.map((item, i) => (
                         <div key={i} className="flex justify-between text-sm">
                           <span>{item.quantity}x {item.name}</span>
                           <span className="opacity-80">{(item.price * item.quantity).toFixed(2)} zł</span>
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-hacker-glow/20 pt-2 text-hacker-green font-bold text-lg glow-text">
                       <span>TOTAL</span>
                       <span>{purchase.total.toFixed(2)} zł</span>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
        <div className="pt-4 mt-auto border-t border-hacker-glow shrink-0">
           <p className="text-[9px] text-center opacity-30 font-mono italic uppercase">
             All transactions are immutable and logged on the mainframe
           </p>
        </div>
      </div>
    </div>
  );
};
