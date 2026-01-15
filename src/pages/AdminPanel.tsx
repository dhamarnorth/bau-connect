import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePeminjaman, StatusPeminjaman } from '@/context/PeminjamanContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Check, X, Eye, Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { peminjaman, updateStatus } = usePeminjaman();
  const { toast } = useToast();
  
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const pendingItems = peminjaman.filter((p) => p.status === 'pending');
  const reviewItems = peminjaman.filter((p) => p.status === 'review');
  const completedItems = peminjaman.filter((p) => p.status === 'accepted' || p.status === 'rejected');

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
          <Button variant="outline" size="sm" onClick={() => viewDetail(item)} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Detail
          </Button>
          {item.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(item.id, 'review')}
                className="flex-1 border-info text-info hover:bg-info hover:text-info-foreground"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Review
              </Button>
            </>
          )}
          {(item.status === 'pending' || item.status === 'review') && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleUpdateStatus(item.id, 'accepted')}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleUpdateStatus(item.id, 'rejected')}
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
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3">
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
