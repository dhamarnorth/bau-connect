import React from 'react';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'review' | 'accepted' | 'rejected' | 'available' | 'unavailable' | 'cancelled' | 'completed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; emoji: string; className: string }> = {
  pending: {
    label: 'Pending',
    emoji: '🟡',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  review: {
    label: 'Review',
    emoji: '🔵',
    className: 'bg-info/10 text-info border-info/20',
  },
  accepted: {
    label: 'Accepted',
    emoji: '🟢',
    className: 'bg-success/10 text-success border-success/20',
  },
  rejected: {
    label: 'Rejected',
    emoji: '🔴',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  cancelled: {
    label: 'Dibatalkan',
    emoji: '⚫',
    className: 'bg-muted text-muted-foreground border-muted',
  },
  completed: {
    label: 'Selesai',
    emoji: '✅',
    className: 'bg-success/10 text-success border-success/20',
  },
  available: {
    label: 'Tersedia',
    emoji: '',
    className: 'bg-success text-success-foreground',
  },
  unavailable: {
    label: 'Tidak Tersedia',
    emoji: '',
    className: 'bg-destructive text-destructive-foreground',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.emoji && <span>{config.emoji}</span>}
      {config.label}
    </span>
  );
};
