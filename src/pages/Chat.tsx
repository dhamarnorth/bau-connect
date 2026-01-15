import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const predefinedResponses: Record<string, string> = {
  'halo': 'Halo! 👋 Saya asisten virtual BAU. Ada yang bisa saya bantu mengenai peminjaman ruangan atau barang?',
  'hi': 'Hi! 👋 Saya asisten virtual BAU. Ada yang bisa saya bantu mengenai peminjaman ruangan atau barang?',
  'hai': 'Hai! 👋 Saya asisten virtual BAU. Ada yang bisa saya bantu mengenai peminjaman ruangan atau barang?',
  'ruangan': 'Untuk meminjam ruangan, silakan:\n1. Klik menu "Pinjam Ruangan" di Dashboard\n2. Pilih ruangan yang tersedia (berwarna hijau)\n3. Isi formulir peminjaman dengan lengkap\n4. Tunggu persetujuan dari admin\n\nApakah ada pertanyaan lain?',
  'barang': 'Untuk meminjam barang, silakan:\n1. Klik menu "Pinjam Barang" di Dashboard\n2. Pilih barang yang tersedia\n3. Tentukan jumlah yang dibutuhkan\n4. Isi formulir peminjaman\n5. Tunggu persetujuan admin\n\nAda yang bisa saya bantu lagi?',
  'status': 'Status peminjaman Anda dapat dilihat di halaman Dashboard. Status terdiri dari:\n🟡 Pending - Menunggu review\n🔵 Review - Sedang ditinjau admin\n🟢 Accepted - Disetujui\n🔴 Rejected - Ditolak\n\nAda pertanyaan lain?',
  'jam': 'Layanan peminjaman BAU buka:\n📅 Senin - Jumat: 08.00 - 16.00 WIB\n📅 Sabtu: 08.00 - 12.00 WIB\n📅 Minggu & Hari Libur: Tutup\n\nAda yang bisa saya bantu lagi?',
  'kontak': 'Untuk informasi lebih lanjut, hubungi:\n📞 Telepon: (021) 123-4567\n📧 Email: bau@kampus.ac.id\n📍 Lokasi: Gedung A Lantai 1\n\nAda pertanyaan lain?',
  'admin': 'Untuk menghubungi admin BAU:\n1. Gunakan chat ini untuk pertanyaan umum\n2. Datang langsung ke kantor BAU di Gedung A Lt. 1\n3. Telepon ke (021) 123-4567\n\nAda yang bisa saya bantu?',
};

const getResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, response] of Object.entries(predefinedResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return 'Terima kasih atas pertanyaannya! 😊 Untuk informasi lebih lanjut mengenai peminjaman ruangan atau barang, silakan tanyakan tentang:\n\n• Cara pinjam "ruangan"\n• Cara pinjam "barang"\n• Cek "status" peminjaman\n• "Jam" operasional\n• "Kontak" admin\n\nAtau ketik pertanyaan Anda secara spesifik.';
};

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Halo ${user?.nama}! 👋\n\nSaya asisten virtual BAU. Saya siap membantu Anda dengan pertanyaan seputar peminjaman ruangan dan barang.\n\nApa yang bisa saya bantu hari ini?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = getResponse(input);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">
                Asisten Virtual BAU
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 space-y-4 max-w-2xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <Card
                className={`max-w-[80%] p-3 ${
                  message.role === 'assistant'
                    ? 'glass-card'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'assistant'
                      ? 'text-muted-foreground'
                      : 'text-primary-foreground/70'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </Card>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="glass-card p-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur-xl p-4 sticky bottom-0">
        <div className="container mx-auto max-w-2xl flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan Anda..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            variant="hero"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
