import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import ruanganDataOriginal from '@/data/ruangan.json';
import barangDataOriginal from '@/data/barang.json';

export type StatusPeminjaman = 'pending' | 'review' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type TipePeminjaman = 'ruangan' | 'barang';

export interface Peminjaman {
  id: string;
  nim: string;
  tipe: TipePeminjaman;
  itemId: string;
  itemNama: string;
  keperluan: string;
  penanggungJawab: string;
  alasan: string;
  durasi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  fotoKTM?: string;
  status: StatusPeminjaman;
  createdAt: string;
  jumlah?: number;
  kritikSaran?: string;
}

export interface Feedback {
  id: string;
  nim: string;
  nama: string;
  kritikSaran: string;
  createdAt: string;
}

export interface RuanganStatus {
  id: string;
  nama: string;
  kapasitas: number;
  ukuran: string;
  tersedia: boolean;
  fasilitas: string[];
  adminBlocked?: boolean; // Admin manually blocked
}

export interface BarangStatus {
  id: string;
  nama: string;
  jumlah: number;
  stok: number;
  tersedia: boolean;
  kategori: string;
  adminBlocked?: boolean;
}

interface PeminjamanContextType {
  peminjaman: Peminjaman[];
  ruanganStatus: RuanganStatus[];
  barangStatus: BarangStatus[];
  feedbacks: Feedback[];
  addPeminjaman: (data: Omit<Peminjaman, 'id' | 'status' | 'createdAt'>) => void;
  updateStatus: (id: string, status: StatusPeminjaman) => void;
  cancelPeminjaman: (id: string) => void;
  getPeminjamanByNim: (nim: string) => Peminjaman[];
  getPendingPeminjaman: () => Peminjaman[];
  getActiveBookingsForItem: (itemId: string, tipe: TipePeminjaman) => Peminjaman[];
  getQueueCount: (itemId: string, tipe: TipePeminjaman) => number;
  toggleRuanganAvailability: (ruanganId: string) => void;
  toggleBarangAvailability: (barangId: string) => void;
  isRuanganAvailable: (ruanganId: string) => boolean;
  isBarangAvailable: (barangId: string) => boolean;
  getEstimatedWaitTime: (itemId: string, tipe: TipePeminjaman) => string | null;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
  getRuanganRecommendation: (kapasitas: number, fasilitas?: string[]) => RuanganStatus[];
}

const PeminjamanContext = createContext<PeminjamanContextType | undefined>(undefined);

export const PeminjamanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [ruanganStatus, setRuanganStatus] = useState<RuanganStatus[]>([]);
  const [barangStatus, setBarangStatus] = useState<BarangStatus[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Initialize ruangan and barang from JSON
  useEffect(() => {
    const savedPeminjaman = localStorage.getItem('bau_peminjaman');
    const savedRuangan = localStorage.getItem('bau_ruangan_status');
    const savedBarang = localStorage.getItem('bau_barang_status');
    const savedFeedbacks = localStorage.getItem('bau_feedbacks');

    if (savedPeminjaman) {
      setPeminjaman(JSON.parse(savedPeminjaman));
    }

    if (savedRuangan) {
      setRuanganStatus(JSON.parse(savedRuangan));
    } else {
      const initialRuangan = ruanganDataOriginal.map((r) => ({
        ...r,
        tersedia: true,
        adminBlocked: false,
      }));
      setRuanganStatus(initialRuangan);
      localStorage.setItem('bau_ruangan_status', JSON.stringify(initialRuangan));
    }

    if (savedBarang) {
      setBarangStatus(JSON.parse(savedBarang));
    } else {
      const initialBarang = barangDataOriginal.map((b) => ({
        ...b,
        stok: b.jumlah,
        tersedia: true,
        adminBlocked: false,
      }));
      setBarangStatus(initialBarang);
      localStorage.setItem('bau_barang_status', JSON.stringify(initialBarang));
    }

    if (savedFeedbacks) {
      setFeedbacks(JSON.parse(savedFeedbacks));
    }
  }, []);

  // Check and update expired bookings
  useEffect(() => {
    const checkExpiredBookings = () => {
      const now = new Date();
      let hasChanges = false;

      const updatedPeminjaman = peminjaman.map((p) => {
        if (p.status === 'accepted' && p.tanggalSelesai) {
          const endDate = new Date(p.tanggalSelesai);
          if (now > endDate) {
            hasChanges = true;
            return { ...p, status: 'completed' as StatusPeminjaman };
          }
        }
        return p;
      });

      if (hasChanges) {
        savePeminjaman(updatedPeminjaman);
      }
    };

    const interval = setInterval(checkExpiredBookings, 30000); // Check every 30 seconds
    checkExpiredBookings(); // Initial check

    return () => clearInterval(interval);
  }, [peminjaman]);

  const savePeminjaman = (data: Peminjaman[]) => {
    localStorage.setItem('bau_peminjaman', JSON.stringify(data));
    setPeminjaman(data);
  };

  const saveRuanganStatus = (data: RuanganStatus[]) => {
    localStorage.setItem('bau_ruangan_status', JSON.stringify(data));
    setRuanganStatus(data);
  };

  const saveBarangStatus = (data: BarangStatus[]) => {
    localStorage.setItem('bau_barang_status', JSON.stringify(data));
    setBarangStatus(data);
  };

  const saveFeedbacks = (data: Feedback[]) => {
    localStorage.setItem('bau_feedbacks', JSON.stringify(data));
    setFeedbacks(data);
  };

  const addPeminjaman = (data: Omit<Peminjaman, 'id' | 'status' | 'createdAt'>) => {
    const newPeminjaman: Peminjaman = {
      ...data,
      id: `PJ${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [...peminjaman, newPeminjaman];
    savePeminjaman(updated);
  };

  const updateStatus = (id: string, status: StatusPeminjaman) => {
    const updated = peminjaman.map((p) =>
      p.id === id ? { ...p, status } : p
    );
    savePeminjaman(updated);
  };

  const cancelPeminjaman = (id: string) => {
    const updated = peminjaman.map((p) =>
      p.id === id ? { ...p, status: 'cancelled' as StatusPeminjaman } : p
    );
    savePeminjaman(updated);
  };

  const getPeminjamanByNim = (nim: string) => {
    return peminjaman.filter((p) => p.nim === nim);
  };

  const getPendingPeminjaman = () => {
    return peminjaman.filter((p) => p.status === 'pending' || p.status === 'review');
  };

  const getActiveBookingsForItem = (itemId: string, tipe: TipePeminjaman): Peminjaman[] => {
    const now = new Date();
    return peminjaman.filter((p) => {
      if (p.itemId !== itemId || p.tipe !== tipe) return false;
      if (p.status === 'cancelled' || p.status === 'rejected' || p.status === 'completed') return false;
      
      const endDate = new Date(p.tanggalSelesai);
      return now <= endDate;
    });
  };

  const getQueueCount = (itemId: string, tipe: TipePeminjaman): number => {
    return getActiveBookingsForItem(itemId, tipe).length;
  };

  const toggleRuanganAvailability = (ruanganId: string) => {
    const updated = ruanganStatus.map((r) =>
      r.id === ruanganId ? { ...r, adminBlocked: !r.adminBlocked } : r
    );
    saveRuanganStatus(updated);
  };

  const toggleBarangAvailability = (barangId: string) => {
    const updated = barangStatus.map((b) =>
      b.id === barangId ? { ...b, adminBlocked: !b.adminBlocked } : b
    );
    saveBarangStatus(updated);
  };

  const isRuanganAvailable = useCallback((ruanganId: string): boolean => {
    const ruangan = ruanganStatus.find((r) => r.id === ruanganId);
    if (!ruangan || ruangan.adminBlocked) return false;

    const now = new Date();
    const activeBookings = peminjaman.filter((p) => {
      if (p.itemId !== ruanganId || p.tipe !== 'ruangan') return false;
      if (p.status !== 'accepted') return false;
      
      const startDate = new Date(p.tanggalMulai);
      const endDate = new Date(p.tanggalSelesai);
      return now >= startDate && now <= endDate;
    });

    return activeBookings.length === 0;
  }, [ruanganStatus, peminjaman]);

  const isBarangAvailable = useCallback((barangId: string): boolean => {
    const barang = barangStatus.find((b) => b.id === barangId);
    if (!barang || barang.adminBlocked) return false;

    const now = new Date();
    const activeBookings = peminjaman.filter((p) => {
      if (p.itemId !== barangId || p.tipe !== 'barang') return false;
      if (p.status !== 'accepted') return false;
      
      const endDate = new Date(p.tanggalSelesai);
      return now <= endDate;
    });

    return barang.stok > activeBookings.reduce((sum, b) => sum + (b.jumlah || 1), 0);
  }, [barangStatus, peminjaman]);

  const getEstimatedWaitTime = (itemId: string, tipe: TipePeminjaman): string | null => {
    const activeBookings = getActiveBookingsForItem(itemId, tipe)
      .filter((p) => p.status === 'accepted')
      .sort((a, b) => new Date(a.tanggalSelesai).getTime() - new Date(b.tanggalSelesai).getTime());

    if (activeBookings.length === 0) return null;

    const lastBooking = activeBookings[activeBookings.length - 1];
    const endDate = new Date(lastBooking.tanggalSelesai);
    const now = new Date();
    
    if (now > endDate) return null;

    // Add 10 minutes buffer for estimation
    const bufferMs = 10 * 60 * 1000;
    const diffMs = endDate.getTime() - now.getTime() + bufferMs;
    
    const totalMinutes = Math.ceil(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const diffDays = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (diffDays > 0) {
      if (remainingHours > 0) {
        return `${diffDays} hari ${remainingHours} jam ${minutes} menit`;
      }
      return `${diffDays} hari ${minutes} menit`;
    }
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  const addFeedback = (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: `FB${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...feedbacks, newFeedback];
    saveFeedbacks(updated);
  };

  const getRuanganRecommendation = (kapasitas: number, fasilitas?: string[]): RuanganStatus[] => {
    return ruanganStatus
      .filter((r) => {
        if (r.adminBlocked) return false;
        if (r.kapasitas < kapasitas) return false;
        if (fasilitas && fasilitas.length > 0) {
          return fasilitas.every((f) => r.fasilitas.includes(f));
        }
        return true;
      })
      .filter((r) => isRuanganAvailable(r.id))
      .sort((a, b) => a.kapasitas - b.kapasitas);
  };

  return (
    <PeminjamanContext.Provider
      value={{
        peminjaman,
        ruanganStatus,
        barangStatus,
        feedbacks,
        addPeminjaman,
        updateStatus,
        cancelPeminjaman,
        getPeminjamanByNim,
        getPendingPeminjaman,
        getActiveBookingsForItem,
        getQueueCount,
        toggleRuanganAvailability,
        toggleBarangAvailability,
        isRuanganAvailable,
        isBarangAvailable,
        getEstimatedWaitTime,
        addFeedback,
        getRuanganRecommendation,
      }}
    >
      {children}
    </PeminjamanContext.Provider>
  );
};

export const usePeminjaman = () => {
  const context = useContext(PeminjamanContext);
  if (context === undefined) {
    throw new Error('usePeminjaman must be used within a PeminjamanProvider');
  }
  return context;
};
