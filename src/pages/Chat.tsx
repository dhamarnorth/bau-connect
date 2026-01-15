import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePeminjaman } from '@/context/PeminjamanContext';
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

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    ruanganStatus, 
    barangStatus, 
    isRuanganAvailable, 
    isBarangAvailable,
    getQueueCount,
    getEstimatedWaitTime,
    getRuanganRecommendation,
    peminjaman
  } = usePeminjaman();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Halo ${user?.nama}! 👋\n\nSaya asisten virtual BAU. Saya siap membantu Anda dengan pertanyaan seputar peminjaman ruangan dan barang.\n\nAnda bisa bertanya tentang:\n• Ketersediaan ruangan\n• Rekomendasi ruangan\n• Status barang\n• Cara peminjaman\n\nApa yang bisa saya bantu hari ini?`,
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

  const getSmartResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Check for room availability queries
    const ruanganMatch = lowerMessage.match(/(?:ruang(?:an)?|room)\s*([a-z]?\d+)/i);
    if (ruanganMatch || lowerMessage.includes('tersedia') || lowerMessage.includes('available')) {
      if (ruanganMatch) {
        const ruanganId = ruanganMatch[1].toUpperCase();
        const ruangan = ruanganStatus.find(r => r.id === ruanganId || r.id === `A${ruanganId.replace(/^A/i, '')}`);
        
        if (ruangan) {
          const available = isRuanganAvailable(ruangan.id);
          const queue = getQueueCount(ruangan.id, 'ruangan');
          const waitTime = getEstimatedWaitTime(ruangan.id, 'ruangan');
          
          if (ruangan.adminBlocked) {
            return `❌ **${ruangan.nama}** sedang dinonaktifkan oleh admin.\n\nSilakan pilih ruangan lain atau hubungi admin untuk informasi lebih lanjut.`;
          }
          
          if (available) {
            return `✅ **${ruangan.nama}** tersedia untuk dipinjam!\n\n📍 Kapasitas: ${ruangan.kapasitas} orang\n📐 Ukuran: ${ruangan.ukuran}\n🛠 Fasilitas: ${ruangan.fasilitas.join(', ')}\n\nSilakan klik menu "Pinjam Ruangan" di Dashboard untuk mengajukan peminjaman.`;
          } else {
            let response = `⏳ **${ruangan.nama}** sedang digunakan.\n\n`;
            if (queue > 0) {
              response += `📊 Antrian saat ini: ${queue} booking\n`;
            }
            if (waitTime) {
              response += `⏰ Estimasi tersedia: ${waitTime}\n`;
            }
            response += `\nAnda tetap bisa mengajukan peminjaman untuk waktu yang berbeda.`;
            return response;
          }
        } else {
          return `Maaf, saya tidak menemukan ruangan dengan ID tersebut. Ruangan yang tersedia: A01 - A10.`;
        }
      }
      
      // General availability check
      const availableRooms = ruanganStatus.filter(r => isRuanganAvailable(r.id) && !r.adminBlocked);
      const unavailableRooms = ruanganStatus.filter(r => !isRuanganAvailable(r.id) || r.adminBlocked);
      
      let response = `📊 **Status Ketersediaan Ruangan:**\n\n`;
      response += `✅ **Tersedia (${availableRooms.length}):**\n`;
      availableRooms.forEach(r => {
        response += `• ${r.nama} (${r.kapasitas} orang, ${r.ukuran})\n`;
      });
      
      if (unavailableRooms.length > 0) {
        response += `\n❌ **Tidak Tersedia (${unavailableRooms.length}):**\n`;
        unavailableRooms.forEach(r => {
          const waitTime = getEstimatedWaitTime(r.id, 'ruangan');
          response += `• ${r.nama}${waitTime ? ` - tersedia dalam ${waitTime}` : r.adminBlocked ? ' (dinonaktifkan)' : ''}\n`;
        });
      }
      
      return response;
    }
    
    // Room recommendation
    if (lowerMessage.includes('rekomendasi') || lowerMessage.includes('recommend') || lowerMessage.includes('saran')) {
      // Check for capacity mentions
      const capacityMatch = lowerMessage.match(/(\d+)\s*(?:orang|people|peserta)/);
      const capacity = capacityMatch ? parseInt(capacityMatch[1]) : 10;
      
      // Check for facility requirements
      const facilities: string[] = [];
      if (lowerMessage.includes('proyektor') || lowerMessage.includes('projector')) facilities.push('Proyektor');
      if (lowerMessage.includes('sound') || lowerMessage.includes('speaker')) facilities.push('Sound System');
      if (lowerMessage.includes('ac')) facilities.push('AC');
      if (lowerMessage.includes('mic') || lowerMessage.includes('microphone')) facilities.push('Mic');
      if (lowerMessage.includes('video conference')) facilities.push('Video Conference');
      
      const recommendations = getRuanganRecommendation(capacity, facilities.length > 0 ? facilities : undefined);
      
      if (recommendations.length === 0) {
        return `Maaf, tidak ada ruangan yang tersedia sesuai kriteria Anda saat ini.\n\nCoba:\n• Kurangi jumlah kapasitas yang dibutuhkan\n• Cek kembali nanti karena mungkin ada ruangan yang akan tersedia`;
      }
      
      let response = `🎯 **Rekomendasi Ruangan untuk ${capacity} orang:**\n\n`;
      recommendations.slice(0, 3).forEach((r, i) => {
        response += `${i + 1}. **${r.nama}**\n`;
        response += `   📍 Kapasitas: ${r.kapasitas} orang\n`;
        response += `   📐 Ukuran: ${r.ukuran}\n`;
        response += `   🛠 Fasilitas: ${r.fasilitas.join(', ')}\n\n`;
      });
      
      response += `Silakan pilih salah satu dan ajukan peminjaman melalui menu "Pinjam Ruangan".`;
      return response;
    }
    
    // Check barang availability
    if (lowerMessage.includes('barang') || lowerMessage.includes('alat') || lowerMessage.includes('peralatan')) {
      const availableBarang = barangStatus.filter(b => isBarangAvailable(b.id) && !b.adminBlocked);
      const unavailableBarang = barangStatus.filter(b => !isBarangAvailable(b.id) || b.adminBlocked);
      
      let response = `📦 **Status Ketersediaan Barang:**\n\n`;
      response += `✅ **Tersedia (${availableBarang.length}):**\n`;
      availableBarang.forEach(b => {
        response += `• ${b.nama} (Stok: ${b.stok})\n`;
      });
      
      if (unavailableBarang.length > 0) {
        response += `\n❌ **Tidak Tersedia (${unavailableBarang.length}):**\n`;
        unavailableBarang.forEach(b => {
          response += `• ${b.nama}\n`;
        });
      }
      
      return response;
    }
    
    // Queue/antrian info
    if (lowerMessage.includes('antrian') || lowerMessage.includes('queue') || lowerMessage.includes('booking')) {
      let response = `📊 **Status Antrian Peminjaman:**\n\n`;
      
      const roomsWithQueue = ruanganStatus.filter(r => getQueueCount(r.id, 'ruangan') > 0);
      if (roomsWithQueue.length > 0) {
        response += `**Ruangan:**\n`;
        roomsWithQueue.forEach(r => {
          const queue = getQueueCount(r.id, 'ruangan');
          const waitTime = getEstimatedWaitTime(r.id, 'ruangan');
          response += `• ${r.nama}: ${queue} booking${waitTime ? ` (tersedia dalam ${waitTime})` : ''}\n`;
        });
      } else {
        response += `Tidak ada antrian untuk ruangan saat ini.\n`;
      }
      
      return response;
    }
    
    // Predefined responses
    const predefinedResponses: Record<string, string> = {
      'halo': 'Halo! 👋 Saya asisten virtual BAU. Ada yang bisa saya bantu mengenai peminjaman ruangan atau barang?',
      'hi': 'Hi! 👋 Saya asisten virtual BAU. Ada yang bisa saya bantu mengenai peminjaman ruangan atau barang?',
      'hai': 'Hai! 👋 Saya asisten virtual BAU. Ada yang bisa saya bantu mengenai peminjaman ruangan atau barang?',
      'cara': 'Untuk meminjam ruangan/barang:\n1. Klik menu "Pinjam Ruangan" atau "Pinjam Barang" di Dashboard\n2. Pilih item yang tersedia (berwarna hijau)\n3. Isi formulir peminjaman dengan lengkap\n4. Tunggu persetujuan dari admin\n\nApakah ada pertanyaan lain?',
      'status': 'Status peminjaman Anda dapat dilihat di halaman Dashboard. Status terdiri dari:\n🟡 Pending - Menunggu review\n🔵 Review - Sedang ditinjau admin\n🟢 Accepted - Disetujui\n🔴 Rejected - Ditolak\n⚪ Cancelled - Dibatalkan\n\nAnda juga bisa membatalkan peminjaman yang masih pending atau review.',
      'jam': 'Layanan peminjaman BAU buka:\n📅 Senin - Jumat: 08.00 - 16.00 WIB\n📅 Sabtu: 08.00 - 12.00 WIB\n📅 Minggu & Hari Libur: Tutup\n\nAda yang bisa saya bantu lagi?',
      'kontak': 'Untuk informasi lebih lanjut, hubungi:\n📞 Telepon: (021) 123-4567\n📧 Email: bau@kampus.ac.id\n📍 Lokasi: Gedung A Lantai 1\n\nAda pertanyaan lain?',
      'batal': 'Untuk membatalkan peminjaman:\n1. Buka Dashboard\n2. Lihat status peminjaman Anda\n3. Klik tombol ❌ pada peminjaman yang ingin dibatalkan\n\nCatatan: Hanya peminjaman dengan status Pending atau Review yang bisa dibatalkan.',
      'cancel': 'Untuk membatalkan peminjaman:\n1. Buka Dashboard\n2. Lihat status peminjaman Anda\n3. Klik tombol ❌ pada peminjaman yang ingin dibatalkan\n\nCatatan: Hanya peminjaman dengan status Pending atau Review yang bisa dibatalkan.',
    };
    
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return 'Terima kasih atas pertanyaannya! 😊\n\nSaya bisa membantu Anda dengan:\n\n• **Cek ketersediaan**: "Apakah ruang A01 tersedia?"\n• **Rekomendasi**: "Rekomendasikan ruangan untuk 20 orang"\n• **Status barang**: "Apa saja barang yang tersedia?"\n• **Antrian**: "Berapa antrian ruangan?"\n• **Cara peminjaman**: "Bagaimana cara meminjam?"\n• **Pembatalan**: "Bagaimana cara membatalkan?"\n\nSilakan tanyakan sesuai kebutuhan Anda!';
  };

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

    const response = getSmartResponse(input);
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
