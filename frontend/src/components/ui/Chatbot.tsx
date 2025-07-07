import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi, I’m Leo. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Leo is having trouble thinking right now 😵‍💫' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-30">
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.1 }}
          className="bg-white p-2 rounded-full shadow-xl"
        >
          <img
            src="/walker.png"
            alt="Chat with Leo"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-accent"
          />
        </motion.button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end items-end max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-80 h-[450px] bg-glass border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg flex flex-col overflow-hidden m-4"
          >
            <div className="bg-black/40 px-4 py-3 flex justify-between items-center border-b border-white/10">
              <span className="font-semibold text-white">AskLeo 🙋‍♂️</span>
              <button onClick={() => setOpen(false)} className="text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg max-w-[80%] ${
                    msg.sender === 'bot'
                      ? 'bg-white/10 text-white self-start'
                      : 'bg-accent text-primary self-end ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="p-2 rounded-lg bg-white/10 text-white self-start max-w-[80%] animate-pulse">
                  Leo is typing...
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/30">
              <input
                className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-400 outline-none"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="text-white font-medium px-2">
                Send
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
