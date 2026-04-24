import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
};

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      if (data.response) {
        setMessages((prev) => [...prev, data.response]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Connection error. The MCP server or OpenRouter might be unreachable.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter messages to show only user and assistant (no tool calls logic)
  const displayMessages = messages.filter((m) => m.role === 'user' || (m.role === 'assistant' && !m.tool_calls));

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg shadow-hacker-glow/20 bg-hacker-bg border-2 border-hacker-glow text-hacker-green transition-all duration-300 hover:scale-110 hover:shadow-hacker-glow/50 ${
          isOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'
        }`}
        aria-label="Toggle AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10a10.02 10.02 0 0 1-5.6-1.7l-4.4 1.3 1.3-4.4A9.98 9.98 0 0 1 2 12C2 6.48 6.48 2 12 2z"/>
          <path d="M8 12h.01"/>
          <path d="M12 12h.01"/>
          <path d="M16 12h.01"/>
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] h-[550px] max-h-[calc(100vh-48px)] flex flex-col bg-hacker-bg/80 backdrop-blur-md hacker-border rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl shadow-hacker-glow/30 ${
          isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-20 opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hacker-glow/30 bg-hacker-terminal/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hacker-green/20 flex items-center justify-center border border-hacker-green/50 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-hacker-green animate-pulse">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
                <path d="M2 14h2"/>
                <path d="M20 14h2"/>
                <path d="M15 13v2"/>
                <path d="M9 13v2"/>
              </svg>
              {/* Online Indicator */}
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-hacker-green rounded-full border-2 border-hacker-bg shadow-[0_0_5px_var(--color-hacker-green)]"></div>
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold glow-text tracking-wide">SysAdmin AI</h3>
              <p className="text-[10px] text-hacker-green/70">Connected via MCP</p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="p-2 rounded-full hover:bg-hacker-green/10 text-hacker-green/70 hover:text-hacker-green transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
          {displayMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-hacker-green">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <div>
                <p className="text-sm font-mono glow-text">Initialization complete.</p>
                <p className="text-xs mt-1">Awaiting user input...</p>
              </div>
            </div>
          ) : (
            displayMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-hacker-green/20 border border-hacker-green/30 text-hacker-green rounded-tr-sm backdrop-blur-sm'
                      : 'bg-hacker-terminal border border-hacker-glow/20 text-hacker-green rounded-tl-sm shadow-[0_0_10px_var(--hacker-glow)_inset]'
                  }`}
                  style={{
                    wordBreak: 'break-word',
                  }}
                >
                  <span className="font-mono">{msg.content}</span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-hacker-terminal border border-hacker-glow/20 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-hacker-green rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-hacker-green rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-hacker-green rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-hacker-glow/30 bg-hacker-bg/50 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-hacker-terminal/30 border border-hacker-glow/50 rounded-lg px-4 py-2 text-sm text-hacker-green placeholder-hacker-green/30 focus:outline-none focus:border-hacker-green focus:shadow-[0_0_10px_var(--color-hacker-green)] transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-hacker-green/10 border border-hacker-green/50 text-hacker-green hover:bg-hacker-green hover:text-hacker-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[-1px] translate-y-[1px]">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
};
