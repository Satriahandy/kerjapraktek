import React, { useState } from 'react';
import { History, Trash2, Search, AlertTriangle, FileSpreadsheet, FileDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

// Library untuk export
import * as XLSX from 'xlsx';
import jsPDF from 'jsPDF';
import autoTable from 'jspdf-autotable';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string | number) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);

  // --- LOGIKA FILTER ---
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && t.type === activeFilter;
  });

  // --- HITUNG TOTAL ---
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netTotal = totalIncome - totalExpense;

  const handleDeleteClick = (id: string | number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  // --- LOGIKA DOWNLOAD EXCEL DENGAN TOTAL ---
  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) return toast.error("Tidak ada data");
    
    try {
      const dataToExport = filteredTransactions.map(t => ({
        Tanggal: new Date(t.date).toLocaleDateString('id-ID'),
        Kategori: t.category,
        Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Jumlah: t.amount,
        Keterangan: t.description || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      
      // Menambahkan baris total di bawah data (Origin: A + panjang data + 2 baris kosong)
      const lastRowIndex = dataToExport.length + 2;
      XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Baris kosong
        ["", "TOTAL PEMASUKAN", "", totalIncome],
        ["", "TOTAL PENGELUARAN", "", totalExpense],
        ["", "SALDO AKHIR", "", netTotal]
      ], { origin: `A${lastRowIndex}` });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      XLSX.writeFile(workbook, `Laporan_Transaksi_${new Date().getTime()}.xlsx`);
      toast.success('Excel berhasil diunduh dengan total!');
    } catch (error) {
      toast.error('Gagal unduh Excel');
    }
  };

  // --- LOGIKA DOWNLOAD PDF DENGAN TOTAL ---
  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) return toast.error("Tidak ada data");

    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Laporan Riwayat Transaksi", 14, 15);
      
      const tableData = filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString('id-ID'),
        t.category,
        t.type === 'income' ? 'Masuk' : 'Keluar',
        formatCurrency(t.amount),
        t.description || '-'
      ]);

      autoTable(doc, {
        head: [['Tanggal', 'Kategori', 'Tipe', 'Jumlah', 'Keterangan']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }
      });

      // Menambahkan Ringkasan Total di bawah Tabel PDF
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 14, finalY);
      doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 14, finalY + 7);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Saldo Akhir: ${formatCurrency(netTotal)}`, 14, finalY + 15);

      doc.save(`Laporan_Transaksi.pdf`);
      toast.success('PDF berhasil diunduh dengan total!');
    } catch (error) {
      toast.error('Gagal unduh PDF');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Tombol Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <header>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-slate-500 text-sm">Lihat ringkasan keuangan Anda.</p>
        </header>

        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm active:scale-95">
            <FileSpreadsheet size={16} /> <span>Excel</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm active:scale-95">
            <FileDown size={16} /> <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button onClick={() => setActiveFilter('all')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Semua</button>
        <button onClick={() => setActiveFilter('income')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeFilter === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>Pemasukan</button>
        <button onClick={() => setActiveFilter('expense')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeFilter === 'expense' ? "bg-white text-rose-500 shadow-sm" : "text-slate-500")}>Pengeluaran</button>
      </div>

      {/* Tabel */}
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
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.category}</td>
                  <td className={cn("px-6 py-4 text-sm font-bold", t.type === 'income' ? "text-emerald-600" : "text-rose-500")}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteClick(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Summary Row di Web */}
          <div className="bg-slate-50/80 p-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Pemasukan</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Pengeluaran</p><p className="text-sm font-bold text-rose-500">{formatCurrency(totalExpense)}</p></div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-6"><p className="text-[10px] font-bold text-slate-400 uppercase">Saldo</p><p className="text-lg font-black text-slate-900">{formatCurrency(netTotal)}</p></div>
          </div>
        </div>
      </div>
      
      {/* Modal Hapus */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center"><AlertTriangle size={24} /></div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Transaksi?</h3>
                <div className="flex w-full gap-3">
                  <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase">Batal</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase">Hapus</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};