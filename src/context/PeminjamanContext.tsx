import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type StatusPeminjaman = 'pending' | 'review' | 'accepted' | 'rejected';
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
  jumlah?: number; // for barang
}

interface PeminjamanContextType {
  peminjaman: Peminjaman[];
  addPeminjaman: (data: Omit<Peminjaman, 'id' | 'status' | 'createdAt'>) => void;
  updateStatus: (id: string, status: StatusPeminjaman) => void;
  getPeminjamanByNim: (nim: string) => Peminjaman[];
  getPendingPeminjaman: () => Peminjaman[];
}

const PeminjamanContext = createContext<PeminjamanContextType | undefined>(undefined);

export const PeminjamanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bau_peminjaman');
    if (saved) {
      setPeminjaman(JSON.parse(saved));
    }
  }, []);

  const savePeminjaman = (data: Peminjaman[]) => {
    localStorage.setItem('bau_peminjaman', JSON.stringify(data));
    setPeminjaman(data);
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

  const getPeminjamanByNim = (nim: string) => {
    return peminjaman.filter((p) => p.nim === nim);
  };

  const getPendingPeminjaman = () => {
    return peminjaman.filter((p) => p.status === 'pending' || p.status === 'review');
  };

  return (
    <PeminjamanContext.Provider
      value={{
        peminjaman,
        addPeminjaman,
        updateStatus,
        getPeminjamanByNim,
        getPendingPeminjaman,
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
