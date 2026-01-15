import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePeminjaman } from '@/context/PeminjamanContext';
import ruanganData from '@/data/ruangan.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Users, MapPin, Wifi, Monitor, Volume2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ruangan {
  id: string;
  nama: string;
  kapasitas: number;
  ukuran: string;
  tersedia: boolean;
  fasilitas: string[];
}

const fasilitasIcons: Record<string, React.ReactNode> = {
  'AC': <Wifi className="h-4 w-4" />,
  'Proyektor': <Monitor className="h-4 w-4" />,
  'Sound System': <Volume2 className="h-4 w-4" />,
  'Whiteboard': <Check className="h-4 w-4" />,
  'Mic': <Volume2 className="h-4 w-4" />,
  'Video Conference': <Monitor className="h-4 w-4" />,
};

const Ruangan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPeminjaman } = usePeminjaman();
  const { toast } = useToast();
  
  const [selectedRuangan, setSelectedRuangan] = useState<Ruangan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterUkuran, setFilterUkuran] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    keperluan: '',
    penanggungJawab: '',
    alasan: '',
    durasi: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    fotoKTM: '',
  });

  const filteredRuangan = filterUkuran === 'all'
    ? ruanganData
    : ruanganData.filter((r) => r.ukuran === filterUkuran);

  const handleRuanganClick = (ruangan: Ruangan) => {
    if (ruangan.tersedia) {
      setSelectedRuangan(ruangan);
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRuangan || !user) return;

    addPeminjaman({
      nim: user.nim,
      tipe: 'ruangan',
      itemId: selectedRuangan.id,
      itemNama: selectedRuangan.nama,
      ...formData,
    });

    toast({
      title: 'Pengajuan Berhasil! 🎉',
      description: `Peminjaman ${selectedRuangan.nama} telah diajukan. Silakan tunggu persetujuan admin.`,
    });

    setIsDialogOpen(false);
    setFormData({
      keperluan: '',
      penanggungJawab: '',
      alasan: '',
      durasi: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      fotoKTM: '',
    });
    navigate('/dashboard');
  };

  const getUkuranColor = (ukuran: string) => {
    switch (ukuran) {
      case 'Kecil':
        return 'bg-info/10 text-info';
      case 'Menengah':
        return 'bg-warning/10 text-warning';
      case 'Besar':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
              Peminjaman Ruangan
            </h1>
            <p className="text-sm text-muted-foreground">
              Pilih ruangan yang tersedia
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6 animate-slide-up">
          <span className="text-sm text-muted-foreground self-center mr-2">Rekomendasi:</span>
          {['all', 'Kecil', 'Menengah', 'Besar'].map((ukuran) => (
            <Button
              key={ukuran}
              variant={filterUkuran === ukuran ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterUkuran(ukuran)}
              className="text-sm"
            >
              {ukuran === 'all' ? 'Semua' : `${ukuran} (${ukuran === 'Kecil' ? '1-10' : ukuran === 'Menengah' ? '11-30' : '30+'} orang)`}
            </Button>
          ))}
        </div>

        {/* Room Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRuangan.map((ruangan, index) => (
            <Card
              key={ruangan.id}
              className={`glass-card transition-all duration-300 animate-slide-up ${
                ruangan.tersedia
                  ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-1'
                  : 'opacity-60'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleRuanganClick(ruangan)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-display">{ruangan.nama}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      Gedung A
                    </CardDescription>
                  </div>
                  <StatusBadge status={ruangan.tersedia ? 'available' : 'unavailable'} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{ruangan.kapasitas} orang</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUkuranColor(ruangan.ukuran)}`}>
                    {ruangan.ukuran}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ruangan.fasilitas.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
                    >
                      {fasilitasIcons[f] || <Check className="h-3 w-3" />}
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Formulir Peminjaman</DialogTitle>
              <DialogDescription>
                {selectedRuangan?.nama} • Kapasitas {selectedRuangan?.kapasitas} orang
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fotoKTM">Upload Foto KTM/NIM</Label>
                <Input
                  id="fotoKTM"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, fotoKTM: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keperluan">Keperluan</Label>
                <Input
                  id="keperluan"
                  placeholder="Contoh: Rapat Organisasi"
                  value={formData.keperluan}
                  onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="penanggungJawab">Penanggung Jawab / Dosen</Label>
                <Input
                  id="penanggungJawab"
                  placeholder="Nama Penanggung Jawab"
                  value={formData.penanggungJawab}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alasan">Alasan Peminjaman</Label>
                <Textarea
                  id="alasan"
                  placeholder="Jelaskan alasan peminjaman ruangan..."
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                  <Input
                    id="tanggalMulai"
                    type="datetime-local"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                  <Input
                    id="tanggalSelesai"
                    type="datetime-local"
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durasi">Durasi Peminjaman</Label>
                <Input
                  id="durasi"
                  placeholder="Contoh: 2 jam, 1 hari"
                  value={formData.durasi}
                  onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  Ajukan Peminjaman
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Ruangan;
