import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileDown, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

// Library untuk export
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string | number) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);

  // --- STATE UNTUK FILTER BULAN ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  // --- LOGIKA FILTER TRANSAKSI (BULAN & TIPE) ---
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const isSameMonth = tDate.getMonth() === currentDate.getMonth() && 
                        tDate.getFullYear() === currentDate.getFullYear();
    
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = activeFilter === 'all' ? true : t.type === activeFilter;

    // Hanya tampilkan jika bulannya sama DAN tipe/search cocok
    return isSameMonth && matchesSearch && matchesType;
  });

  // --- HITUNG TOTAL BERDASARKAN FILTER BULAN ---
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netTotal = totalIncome - totalExpense;

  // --- EXPORT LOGIC ---
  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) return toast.error("Tidak ada data di bulan ini");
    try {
      const dataToExport = filteredTransactions.map(t => ({
        Tanggal: new Date(t.date).toLocaleDateString('id-ID'),
        Kategori: t.category,
        Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Jumlah: t.amount,
        Keterangan: t.description || '-'
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const lastRowIndex = dataToExport.length + 2;
      XLSX.utils.sheet_add_aoa(worksheet, [
        [], ["", "TOTAL PEMASUKAN", "", totalIncome], ["", "TOTAL PENGELUARAN", "", totalExpense], ["", "SALDO AKHIR", "", netTotal]
      ], { origin: `A${lastRowIndex}` });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      XLSX.writeFile(workbook, `Laporan_${currentDate.toLocaleString('id-ID', { month: 'long' })}.xlsx`);
      toast.success('Excel berhasil diunduh!');
    } catch (error) { toast.error('Gagal unduh Excel'); }
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) return toast.error("Tidak ada data di bulan ini");
    try {
      const doc = new jsPDF();
      doc.text(`Laporan Bulan ${currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`, 14, 15);
      autoTable(doc, {
        head: [['Tanggal', 'Kategori', 'Tipe', 'Jumlah', 'Keterangan']],
        body: filteredTransactions.map(t => [new Date(t.date).toLocaleDateString('id-ID'), t.category, t.type === 'income' ? 'Masuk' : 'Keluar', formatCurrency(t.amount), t.description || '-']),
        startY: 25, theme: 'grid'
      });
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text(`Saldo Akhir: ${formatCurrency(netTotal)}`, 14, finalY);
      doc.save(`Laporan_${currentDate.getTime()}.pdf`);
    } catch (error) { toast.error('Gagal unduh PDF'); }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <header>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-slate-500 text-sm">Data keuangan bulan {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </header>

        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-100 transition-all">
            <FileSpreadsheet size={16} /> <span>Excel</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold uppercase hover:bg-rose-100 transition-all">
            <FileDown size={16} /> <span>PDF</span>
          </button>
        </div>
      </div>

      {/* --- NAVIGASI BULAN --- */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <CalendarIcon size={18} className="text-primary" />
          <span className="text-sm uppercase tracking-widest">
            {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Filter Tipe */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button onClick={() => setActiveFilter('all')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Semua</button>
        <button onClick={() => setActiveFilter('income')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeFilter === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>Pemasukan</button>
        <button onClick={() => setActiveFilter('expense')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeFilter === 'expense' ? "bg-white text-rose-500 shadow-sm" : "text-slate-500")}>Pengeluaran</button>
      </div>

      {/* Tabel Transaksi */}
      <div className="rustic-card bg-white overflow-hidden p-0 border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Jumlah</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.category}</td>
                    <td className={cn("px-6 py-4 text-sm font-bold", t.type === 'income' ? "text-emerald-600" : "text-rose-500")}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setConfirmDeleteId(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Tidak ada transaksi di bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Ringkasan Per Bulan */}
          <div className="bg-slate-50/80 p-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Masuk ({currentDate.toLocaleString('id-ID', {month: 'short'})})</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Keluar ({currentDate.toLocaleString('id-ID', {month: 'short'})})</p><p className="text-sm font-bold text-rose-500">{formatCurrency(totalExpense)}</p></div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-6"><p className="text-[10px] font-bold text-slate-400 uppercase">Sisa Saldo</p><p className="text-lg font-black text-slate-900">{formatCurrency(netTotal)}</p></div>
          </div>
        </div>
      </div>

      {/* Modal Hapus Tetap Sama... */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center"><AlertTriangle size={24} /></div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Transaksi?</h3>
                <div className="flex w-full gap-3">
                  <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">Batal</button>
                  <button onClick={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs">Hapus</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};