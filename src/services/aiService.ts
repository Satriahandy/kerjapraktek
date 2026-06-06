import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({  apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY });
console.log("API KEY:", import.meta.env.VITE_SUPABASE_API_KEY)
export async function analyzeFinancials(transactions: Transaction[]) {
  if (transactions.length === 0) return "Belum ada data untuk dianalisis. Yuk mulai catat transaksi!";

  const summary = transactions.slice(0, 50).map(t => ({
    date: t.date.split('T')[0],
    type: t.type,
    amount: t.amount,
    category: t.category,
    desc: t.description
  }));

  const prompt = `
    Anda adalah asisten keuangan ahli untuk UMKM bernama "Bakmi Jowo Mas Ranto".
    Berikut adalah ringkasan transaksi terakhir: ${JSON.stringify(summary)}
    
    Berikan analisis singkat (maksimal 3-4 kalimat) dalam Bahasa Indonesia yang mencakup:
    1. Tren utama (apakah penjualan naik/turun).
    2. Satu rekomendasi praktis untuk meningkatkan keuntungan atau efisiensi biaya.
    3. Nada bicara ramah, menyemangati, dan profesional seperti konsultan bisnis UMKM.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Check if it's a quota error
    if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return "Kuota analisis AI Gemini sedang penuh (Limit tercapai). Tenang, data keuangan Anda tetap aman. Coba klik 'Perbarui Analisis' beberapa saat lagi ya.";
    }
    
    return "Maaf, Gemini sedang istirahat sejenak. Tapi tenang, bakmi Mas Ranto tetap yang terbaik! Coba lagi nanti ya.";
  }
}
