'use client';

import React, { useEffect } from 'react';
import { MapPin, User, Trash2, ArrowLeftRight, Move } from 'lucide-react';

interface TimetableContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onMove: () => void;
  onSwap: () => void;
  onReassign: () => void;
  onDelete: () => void;
}

export function TimetableContextMenu({
  isOpen,
  x,
  y,
  onClose,
  onMove,
  onSwap,
  onReassign,
  onDelete,
}: TimetableContextMenuProps) {
  useEffect(() => {
    const handleGlobalClick = () => {
      if (isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('click', handleGlobalClick);
    }
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 min-w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-md py-1"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { onMove(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
      >
        <Move className="w-4 h-4" />
        Move
      </button>
      <button
        onClick={() => { onSwap(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
      >
        <ArrowLeftRight className="w-4 h-4" />
        Swap
      </button>
      <button
        onClick={() => { onReassign(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        Reassign Faculty
      </button>
      <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
