import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePeminjaman } from '@/context/PeminjamanContext';
import barangData from '@/data/barang.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Package, Tag, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Barang {
  id: string;
  nama: string;
  jumlah: number;
  tersedia: number;
  kategori: string;
}

const kategoriColors: Record<string, string> = {
  'Elektronik': 'bg-primary/10 text-primary',
  'Audio': 'bg-info/10 text-info',
  'Aksesoris': 'bg-warning/10 text-warning',
  'Peralatan': 'bg-success/10 text-success',
};

const Barang: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPeminjaman } = usePeminjaman();
  const { toast } = useToast();
  
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterKategori, setFilterKategori] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    keperluan: '',
    penanggungJawab: '',
    alasan: '',
    durasi: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    fotoKTM: '',
    jumlah: 1,
  });

  const kategoriList = ['all', ...new Set(barangData.map((b) => b.kategori))];

  const filteredBarang = filterKategori === 'all'
    ? barangData
    : barangData.filter((b) => b.kategori === filterKategori);

  const handleBarangClick = (barang: Barang) => {
    if (barang.tersedia > 0) {
      setSelectedBarang(barang);
      setFormData({ ...formData, jumlah: 1 });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang || !user) return;

    addPeminjaman({
      nim: user.nim,
      tipe: 'barang',
      itemId: selectedBarang.id,
      itemNama: selectedBarang.nama,
      keperluan: formData.keperluan,
      penanggungJawab: formData.penanggungJawab,
      alasan: formData.alasan,
      durasi: formData.durasi,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      fotoKTM: formData.fotoKTM,
      jumlah: formData.jumlah,
    });

    toast({
      title: 'Pengajuan Berhasil! 🎉',
      description: `Peminjaman ${formData.jumlah}x ${selectedBarang.nama} telah diajukan. Silakan tunggu persetujuan admin.`,
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
      jumlah: 1,
    });
    navigate('/dashboard');
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
              Peminjaman Barang
            </h1>
            <p className="text-sm text-muted-foreground">
              Pilih barang yang tersedia
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6 animate-slide-up">
          <span className="text-sm text-muted-foreground self-center mr-2">Kategori:</span>
          {kategoriList.map((kategori) => (
            <Button
              key={kategori}
              variant={filterKategori === kategori ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterKategori(kategori)}
              className="text-sm"
            >
              {kategori === 'all' ? 'Semua' : kategori}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBarang.map((barang, index) => (
            <Card
              key={barang.id}
              className={`glass-card transition-all duration-300 animate-slide-up ${
                barang.tersedia > 0
                  ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-1'
                  : 'opacity-60'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleBarangClick(barang)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-display">{barang.nama}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-0.5">
                        <Tag className="h-3 w-3" />
                        {barang.id}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kategoriColors[barang.kategori] || 'bg-muted text-muted-foreground'}`}>
                    {barang.kategori}
                  </span>
                  <StatusBadge status={barang.tersedia > 0 ? 'available' : 'unavailable'} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Tersedia: <span className={barang.tersedia > 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>{barang.tersedia}</span> / {barang.jumlah}
                  </span>
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
                {selectedBarang?.nama} • Tersedia: {selectedBarang?.tersedia} unit
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah Barang</Label>
                <Input
                  id="jumlah"
                  type="number"
                  min={1}
                  max={selectedBarang?.tersedia || 1}
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

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
                  placeholder="Contoh: Presentasi Tugas Akhir"
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
                  placeholder="Jelaskan alasan peminjaman barang..."
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

export default Barang;
