import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePeminjaman, StatusPeminjaman } from '@/context/PeminjamanContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Check, X, Eye, Clock, AlertCircle, CheckCircle, FileText, DoorOpen, Package, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { 
    peminjaman, 
    updateStatus, 
    ruanganStatus, 
    barangStatus, 
    toggleRuanganAvailability, 
    toggleBarangAvailability,
    getQueueCount,
    feedbacks
  } = usePeminjaman();
  const { toast } = useToast();
  
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const pendingItems = peminjaman.filter((p) => p.status === 'pending');
  const reviewItems = peminjaman.filter((p) => p.status === 'review');
  const completedItems = peminjaman.filter((p) => 
    p.status === 'accepted' || p.status === 'rejected' || p.status === 'completed' || p.status === 'cancelled'
  );

  const handleUpdateStatus = (id: string, status: StatusPeminjaman) => {
    updateStatus(id, status);
    toast({
      title: status === 'accepted' ? 'Peminjaman Disetujui ✅' : status === 'rejected' ? 'Peminjaman Ditolak ❌' : 'Status Diperbarui',
      description: `Status peminjaman telah diubah menjadi ${status}.`,
    });
    setIsDetailOpen(false);
  };

  const viewDetail = (item: any) => {
    setSelectedPeminjaman(item);
    setIsDetailOpen(true);
  };

  const PeminjamanCard = ({ item }: { item: any }) => (
    <Card className="glass-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-display">{item.itemNama}</CardTitle>
            <CardDescription>
              {item.tipe === 'ruangan' ? '🚪 Ruangan' : '📦 Barang'} • {item.nim}
            </CardDescription>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p><strong>Keperluan:</strong> {item.keperluan}</p>
          <p><strong>Durasi:</strong> {item.durasi}</p>
          <p className="text-xs mt-2">
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              viewDetail(item);
            }} 
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Detail
          </Button>
          {item.status === 'pending' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpdateStatus(item.id, 'review');
              }}
              className="flex-1 border-info text-info hover:bg-info hover:text-info-foreground"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Review
            </Button>
          )}
          {(item.status === 'pending' || item.status === 'review') && (
            <>
              <Button
                type="button"
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpdateStatus(item.id, 'accepted');
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpdateStatus(item.id, 'rejected');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              Panel Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola peminjaman ruangan dan barang
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass-card border-warning/20">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingItems.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-info/20">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-8 w-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{reviewItems.length}</p>
                <p className="text-xs text-muted-foreground">Review</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-success/20">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{completedItems.length}</p>
                <p className="text-xs text-muted-foreground">Selesai</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center">
                  {pendingItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
            <TabsTrigger value="manage">Kelola</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingItems.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Tidak ada pengajuan pending</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingItems.map((item) => (
                  <PeminjamanCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {reviewItems.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Tidak ada pengajuan dalam review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {reviewItems.map((item) => (
                  <PeminjamanCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedItems.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Belum ada pengajuan selesai</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {completedItems.map((item) => (
                  <PeminjamanCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Manage Tab - Control Availability */}
          <TabsContent value="manage" className="space-y-6">
            {/* Ruangan Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  Kelola Ketersediaan Ruangan
                </CardTitle>
                <CardDescription>
                  Toggle untuk mengaktifkan/menonaktifkan ruangan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {ruanganStatus.map((ruangan) => {
                    const queueCount = getQueueCount(ruangan.id, 'ruangan');
                    const hasActiveBooking = queueCount > 0;
                    return (
                      <div
                        key={ruangan.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          ruangan.adminBlocked ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/50 border-border/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{ruangan.nama}</p>
                            {queueCount > 0 && (
                              <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                                {queueCount} antrian
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ruangan.kapasitas} orang • {ruangan.ukuran}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasActiveBooking && ruangan.adminBlocked && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-success text-success hover:bg-success hover:text-success-foreground"
                              onClick={() => {
                                toggleRuanganAvailability(ruangan.id);
                                toast({
                                  title: 'Ruangan Diaktifkan Kembali',
                                  description: `${ruangan.nama} telah diaktifkan (booking sebelumnya selesai lebih cepat).`,
                                });
                              }}
                            >
                              Buka Kembali
                            </Button>
                          )}
                          <Label htmlFor={`ruangan-${ruangan.id}`} className="text-sm">
                            {ruangan.adminBlocked ? 'Nonaktif' : 'Aktif'}
                          </Label>
                          <Switch
                            id={`ruangan-${ruangan.id}`}
                            checked={!ruangan.adminBlocked}
                            onCheckedChange={() => {
                              toggleRuanganAvailability(ruangan.id);
                              toast({
                                title: ruangan.adminBlocked ? 'Ruangan Diaktifkan' : 'Ruangan Dinonaktifkan',
                                description: `${ruangan.nama} telah ${ruangan.adminBlocked ? 'diaktifkan' : 'dinonaktifkan'}.`,
                              });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Barang Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-success" />
                  Kelola Ketersediaan Barang
                </CardTitle>
                <CardDescription>
                  Toggle untuk mengaktifkan/menonaktifkan barang
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {barangStatus.map((barang) => {
                    const queueCount = getQueueCount(barang.id, 'barang');
                    return (
                      <div
                        key={barang.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{barang.nama}</p>
                            {queueCount > 0 && (
                              <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                                {queueCount} antrian
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Stok: {barang.stok} • {barang.kategori}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Label htmlFor={`barang-${barang.id}`} className="text-sm">
                            {barang.adminBlocked ? 'Nonaktif' : 'Aktif'}
                          </Label>
                          <Switch
                            id={`barang-${barang.id}`}
                            checked={!barang.adminBlocked}
                            onCheckedChange={() => {
                              toggleBarangAvailability(barang.id);
                              toast({
                                title: barang.adminBlocked ? 'Barang Diaktifkan' : 'Barang Dinonaktifkan',
                                description: `${barang.nama} telah ${barang.adminBlocked ? 'diaktifkan' : 'dinonaktifkan'}.`,
                              });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Kritik dan Saran
                </CardTitle>
                <CardDescription>
                  Feedback dari pengguna sistem peminjaman
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <p>Belum ada feedback</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.slice().reverse().map((fb) => (
                      <div key={fb.id} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{fb.nama}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(fb.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{fb.kritikSaran}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Detail Peminjaman</DialogTitle>
              <DialogDescription>
                ID: {selectedPeminjaman?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedPeminjaman && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedPeminjaman.itemNama}</span>
                  <StatusBadge status={selectedPeminjaman.status} />
                </div>

                {selectedPeminjaman.fotoKTM && (
                  <div>
                    <p className="text-sm font-medium mb-2">Foto KTM:</p>
                    <img
                      src={selectedPeminjaman.fotoKTM}
                      alt="KTM"
                      className="w-full max-w-xs rounded-lg border"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">NIM</p>
                    <p className="font-medium">{selectedPeminjaman.nim}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipe</p>
                    <p className="font-medium capitalize">{selectedPeminjaman.tipe}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Keperluan</p>
                    <p className="font-medium">{selectedPeminjaman.keperluan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Penanggung Jawab</p>
                    <p className="font-medium">{selectedPeminjaman.penanggungJawab}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durasi</p>
                    <p className="font-medium">{selectedPeminjaman.durasi}</p>
                  </div>
                  {selectedPeminjaman.jumlah && (
                    <div>
                      <p className="text-muted-foreground">Jumlah</p>
                      <p className="font-medium">{selectedPeminjaman.jumlah} unit</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Alasan</p>
                    <p className="font-medium">{selectedPeminjaman.alasan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mulai</p>
                    <p className="font-medium">
                      {new Date(selectedPeminjaman.tanggalMulai).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Selesai</p>
                    <p className="font-medium">
                      {new Date(selectedPeminjaman.tanggalSelesai).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {selectedPeminjaman.kritikSaran && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Kritik & Saran</p>
                      <p className="font-medium">{selectedPeminjaman.kritikSaran}</p>
                    </div>
                  )}
                </div>

                {(selectedPeminjaman.status === 'pending' || selectedPeminjaman.status === 'review') && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedPeminjaman.id, 'rejected')}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Tolak
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => handleUpdateStatus(selectedPeminjaman.id, 'accepted')}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Setujui
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminPanel;
