import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 1. Impor sebagai fungsi mandiri
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// 2. Hapus declare module 'jspdf' karena kita akan pakai fungsi autoTable secara langsung
// Ini jauh lebih aman untuk menghindari error "is not a function"

export const exportToExcel = (transactions: any[]) => {
  const data = transactions.map(t => ({
    'Tanggal': format(new Date(t.date), 'dd/MM/yyyy'),
    'Keterangan': t.description,
    'Kategori': t.category,
    'Jenis': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Jumlah': t.amount
  }));

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Transaksi');
  
  writeFile(workbook, `Laporan_BakmiJowo_Ranto_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportToPDF = (transactions: any[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Laporan Transaksi Bakmi Jowo Ranto', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 14, 30);

  const tableData = transactions.map(t => [
    format(new Date(t.date), 'dd/MM/yyyy'),
    t.description,
    t.category,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(t.amount)
  ]);

  // 3. PANGGIL SEBAGAI FUNGSI: autoTable(doc, { ... })
  // Bukan doc.autoTable({ ... })
  autoTable(doc, {
    startY: 40,
    head: [['Tanggal', 'Keterangan', 'Kategori', 'Jenis', 'Jumlah']],
    body: tableData,
    headStyles: { 
      fillColor: [241, 202, 22], 
      textColor: [31, 41, 55], 
      fontStyle: 'bold',
      halign: 'center' 
    },
    columnStyles: {
      4: { halign: 'right' } // Merapikan kolom jumlah agar rata kanan
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 40 },
  });

  doc.save(`Laporan_BakmiJowo_Ranto_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};