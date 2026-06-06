import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // 1. Impor sebagai fungsi mandiri
import { format } from "date-fns";
import { id } from "date-fns/locale";

// 2. Hapus declare module 'jspdf' karena kita akan pakai fungsi autoTable secara langsung
// Ini jauh lebih aman untuk menghindari error "is not a function"
export const exportToExcel = (transactions: any[]) => {
  // ========================
  // FORMAT DATA
  // ========================
  const data = transactions.map((t) => ({
    Tanggal: format(new Date(t.date), "dd/MM/yyyy"),
    Keterangan: t.description,
    Kategori: t.category,
    Jenis: t.type === "income" ? "Pemasukan" : "Pengeluaran",
    Jumlah: t.amount,
  }));

  // ========================
  // HITUNG TOTAL
  // ========================
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const total = totalIncome - totalExpense;

  // ========================
  // BUAT SHEET
  // ========================
  const worksheet = utils.json_to_sheet(data);

  // ========================
  // AUTO WIDTH KOLOM
  // ========================
  const colWidths = [
    { wch: 12 }, // Tanggal
    { wch: 25 }, // Keterangan
    { wch: 20 }, // Kategori
    { wch: 15 }, // Jenis
    { wch: 18 }, // Jumlah
  ];
  worksheet["!cols"] = colWidths;

  // ========================
  // FORMAT CURRENCY KOLOM JUMLAH
  // ========================
  const range = utils.decode_range(worksheet["!ref"] || "");
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellAddress = utils.encode_cell({ r: R, c: 4 });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].z = '"Rp"#,##0';
    }
  }

  // ========================
  // TAMBAH SPASI + SUMMARY
  // ========================
  const summaryStartRow = data.length + 2;

  const summaryData = [
    ["", "", "", "Total Pemasukan", totalIncome],
    ["", "", "", "Total Pengeluaran", totalExpense],
    ["", "", "", "Saldo Akhir", total],
  ];

  utils.sheet_add_aoa(worksheet, summaryData, {
    origin: summaryStartRow,
  });

  // ========================
  // FORMAT CURRENCY SUMMARY
  // ========================
  summaryData.forEach((_, i) => {
    const cellAddress = utils.encode_cell({
      r: summaryStartRow + i,
      c: 4,
    });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].z = '"Rp"#,##0';
    }
  });

  // ========================
  // BOLD HEADER (LIMITED SUPPORT)
  // ========================
  const header = ["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah"];
  header.forEach((_, i) => {
    const cell = utils.encode_cell({ r: 0, c: i });
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true },
      };
    }
  });

  // ========================
  // WORKBOOK
  // ========================
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Transaksi");

  writeFile(
    workbook,
    `Laporan_BakmiJowo_Ranto_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
  );
};

export const exportToPDF = (transactions: any[]) => {
  const doc = new jsPDF();

  // ========================
  // TITLE
  // ========================
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Transaksi", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `Dicetak pada: ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}`,
    14,
    26,
  );

  // ========================
  // FORMAT DATA
  // ========================
  const tableData = transactions.map((t) => [
    format(new Date(t.date), "dd/MM/yyyy"),
    t.description,
    t.category,
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(t.amount),
  ]);

  // ========================
  // HITUNG TOTAL
  // ========================
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const total = totalIncome - totalExpense;

  // ========================
  // TABLE
  // ========================
  autoTable(doc, {
    startY: 32,
    head: [["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah"]],
    body: tableData,

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      halign: "center",
      fontStyle: "bold",
    },

    bodyStyles: {
      textColor: [30, 41, 59],
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252], // zebra
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { halign: "center", cellWidth: 28 },
      4: { halign: "right", cellWidth: 30 },
    },

    margin: { left: 14, right: 14 },
  });

  // ========================
  // SUMMARY
  // ========================
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  doc.setFontSize(11);

  // Total Pemasukan
  doc.setFont("helvetica", "normal");
  doc.text("Total Pemasukan", 120, finalY);
  doc.text(formatCurrency(totalIncome), 190, finalY, { align: "right" });

  // Total Pengeluaran
  doc.text("Total Pengeluaran", 120, finalY + 6);
  doc.text(formatCurrency(totalExpense), 190, finalY + 6, { align: "right" });

  // Garis
  doc.setDrawColor(200);
  doc.line(120, finalY + 10, 190, finalY + 10);

  // Saldo (Bold)
  doc.setFont("helvetica", "bold");
  doc.text("Saldo Akhir", 120, finalY + 16);
  doc.text(formatCurrency(total), 190, finalY + 16, { align: "right" });

  // ========================
  // SAVE
  // ========================
  doc.save(`Laporan_BakmiJowo_Ranto_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
