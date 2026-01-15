import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePeminjaman } from '@/context/PeminjamanContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { DoorOpen, Package, LogOut, Shield, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getPeminjamanByNim, peminjaman } = usePeminjaman();
  const navigate = useNavigate();

  const userPeminjaman = user ? getPeminjamanByNim(user.nim) : [];
  const pendingCount = peminjaman.filter((p) => p.status === 'pending').length;
  const reviewCount = peminjaman.filter((p) => p.status === 'review').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://files.catbox.moe/6a6wzw.png"
              alt="Logo BAU"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Sistem Peminjaman BAU
              </h1>
              <p className="text-sm text-muted-foreground">
                Hi {user?.nim}! 👋
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Panel Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Selamat Datang, {user?.nama}!
          </h2>
          <p className="text-muted-foreground">
            {user?.jurusan} • Semester {user?.semester}
          </p>
        </div>

        {/* Quick Stats */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Card className="glass-card border-warning/20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-info/20 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{reviewCount}</p>
                  <p className="text-sm text-muted-foreground">Sedang Ditinjau</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className="glass-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group animate-slide-up"
            style={{ animationDelay: '0.2s' }}
            onClick={() => navigate('/ruangan')}
          >
            <CardHeader className="pb-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <DoorOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Pinjam Ruangan</CardTitle>
              <CardDescription>
                Ajukan peminjaman ruangan untuk kegiatan perkuliahan, rapat, atau acara lainnya
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full">
                Lihat Ruangan
              </Button>
            </CardContent>
          </Card>

          <Card
            className="glass-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group animate-slide-up"
            style={{ animationDelay: '0.25s' }}
            onClick={() => navigate('/barang')}
          >
            <CardHeader className="pb-4">
              <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-xl font-display">Pinjam Barang</CardTitle>
              <CardDescription>
                Ajukan peminjaman peralatan seperti proyektor, laptop, atau perlengkapan lainnya
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="success" className="w-full">
                Lihat Barang
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Peminjaman */}
        {userPeminjaman.length > 0 && (
          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Status Peminjaman Anda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPeminjaman.slice(-5).reverse().map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.itemNama}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.tipe === 'ruangan' ? '🚪 Ruangan' : '📦 Barang'} • {p.keperluan}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(p.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chatbot FAB */}
        <Button
          variant="gradient"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl animate-bounce-gentle"
          onClick={() => navigate('/chat')}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </main>
    </div>
  );
};

export default Dashboard;
