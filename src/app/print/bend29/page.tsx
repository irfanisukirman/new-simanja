
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Define interfaces for the data structures
interface ExportedItem {
  id: number;
  tanggal: string;
  nama_barang: string;
  penerima: string;
  satuan: string;
  qty: number;
  harga_satuan: string;
  total_harga: string;
}

interface Signatory {
    nama: string;
    nip: string | null;
    pangkat_golongan: string | null;
}

interface ExportData {
  items: ExportedItem[];
  pegawai: Signatory;
  range: {
      start_date: string;
      end_date: string;
  };
}


const formatCurrency = (value: number | string | undefined) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numericValue === undefined || isNaN(numericValue) || numericValue === 0) return "-";
    return new Intl.NumberFormat('id-ID').format(numericValue);
}

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return "-";
  try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
  } catch {
      return String(dateString);
  }
};

const terbilang = (n: number): string => {
    if (!n || isNaN(n)) return "";
    if (n < 0) return "Minus " + terbilang(-n);
    const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (n < 12) return satuan[n];
    if (n < 20) return terbilang(n - 10) + " Belas";
    if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
    if (n < 200) return "Seratus " + terbilang(n - 100);
    if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
    if (n < 2000) return "Seribu " + terbilang(n - 1000);
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
    return "Jumlah besar";
}

export default function Bend29Page() {
    const [exportData, setExportData] = useState<ExportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [today, setToday] = useState<Date | null>(null);

    useEffect(() => {
      const storedData = sessionStorage.getItem('exportData');
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setExportData(parsedData);
        } catch (e) {
          console.error("Failed to parse export data from sessionStorage", e);
        }
      }
      
      setToday(new Date());
      setIsLoading(false);
      
      // Optional: Clear the data after reading to prevent reuse
      // sessionStorage.removeItem('exportData');

    }, []);

    const itemsToDisplay = exportData?.items || [];
    const totalHarga = itemsToDisplay.reduce((acc, item) => acc + parseFloat(item.total_harga || '0'), 0);
    const penerima = exportData?.pegawai;

    const pengurusBarang: Signatory = {
        nama: "Fitriani Hamidah",
        nip: "199506222025212001",
        pangkat_golongan: "V"
    };

    const kasubag: Signatory = {
        nama: "Firmansyah, S.Sos., M.Si.",
        nip: "197507242010011007",
        pangkat_golongan: "Penata Tingkat I (III/d)"
    };


    if (isLoading) {
      return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-white text-black">
          <div className="flex justify-center items-center h-screen">
             <p>Memuat data pratinjau...</p>
          </div>
        </div>
      );
    }
    
    if (!exportData || itemsToDisplay.length === 0) {
        return (
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-white text-black">
                <div className="flex justify-center items-center h-screen">
                    <p className="text-center text-xl">Tidak ada data untuk ditampilkan. <br/> Silakan kembali dan ekspor data terlebih dahulu.</p>
                </div>
            </div>
        );
    }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-white text-black">
      <div className="flex items-center justify-end print-hidden mb-4">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak
        </Button>
      </div>
      
      <div className="rounded-md border border-black p-6 A4-sheet">
        <header className="mb-4">
          <div className="flex justify-between items-start">
            <div className="text-sm">
              <p>DAERAH/UNIT:</p>
            </div>
            <div className="text-sm">
                <div className="flex gap-2">
                    <p>Model</p>
                    <p>:</p>
                </div>
                 <div className="flex gap-2">
                    <p>No</p>
                    <p style={{marginLeft: '1.2rem'}}>:</p>
                </div>
            </div>
            <div className="border-2 border-black p-1 text-center font-bold">
              BEND 29
            </div>
          </div>
          <div className="text-center font-bold mt-2">
            <h2 className="text-sm uppercase">PEMERINTAH DAERAH PROVINSI JAWA BARAT</h2>
            <h3 className="text-sm uppercase">GUDANG : BADAN PENGEMBANGAN SUMBER DAYA MANUSIA</h3>
            <p className="text-xs">BUKTI BARANG DARI DAERAH / UNIT : BPSDM JAWA BARAT</p>
            <p className="text-xs">KEPADA DAERAH / UNIT : SEKRETARIAT</p>
          </div>
        </header>

        <Table className="border-collapse border border-black text-xs">
          <TableHeader>
            <TableRow className="border-b border-black">
              <TableHead rowSpan={2} className="border border-black text-center text-black font-bold align-middle w-[100px]">Tanggal Penyerahan Barang Menurut Permintaan</TableHead>
              <TableHead rowSpan={2} className="border border-black text-center text-black font-bold align-middle w-[100px]">Barang diterima dari Gudang</TableHead>
              <TableHead rowSpan={2} className="border border-black text-center text-black font-bold align-middle">Nama dan Kode Barang</TableHead>
              <TableHead rowSpan={2} className="border border-black text-center text-black font-bold align-middle">Satuan</TableHead>
              <TableHead colSpan={2} className="border border-black text-center text-black font-bold align-middle">Jumlah Barang</TableHead>
              <TableHead rowSpan={2} className="border border-black text-center text-black font-bold align-middle">Harga Satuan</TableHead>
              <TableHead rowSpan={2} className="border border-black text-center text-black font-bold align-middle">Jumlah Harga</TableHead>
            </TableRow>
             <TableRow className="border-b border-black">
              <TableHead className="border border-black text-center text-black font-bold">Angka</TableHead>
              <TableHead className="border border-black text-center text-black font-bold">Huruf</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemsToDisplay.map((item, index) => (
              <TableRow key={index} className="border-b border-black">
                <TableCell className="border border-black text-center p-1">{formatDate(item.tanggal)}</TableCell>
                <TableCell className="border border-black text-center p-1">BPSDM</TableCell>
                <TableCell className="border border-black p-1">{item.nama_barang}</TableCell>
                <TableCell className="border border-black text-center p-1">{item.satuan}</TableCell>
                <TableCell className="border border-black text-center p-1">{item.qty}</TableCell>
                <TableCell className="border border-black text-center p-1">{terbilang(item.qty)}</TableCell>
                <TableCell className="border border-black text-right p-1">{formatCurrency(item.harga_satuan)}</TableCell>
                <TableCell className="border border-black text-right p-1">{formatCurrency(item.total_harga)}</TableCell>
              </TableRow>
            ))}
             <TableRow className="border-b border-black font-bold">
                <TableCell colSpan={7} className="border border-black text-center p-1">TOTAL</TableCell>
                <TableCell className="border border-black text-right p-1">{formatCurrency(totalHarga)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="signature-section">
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-1">
                  <p>Daerah / Unit Umum</p>
                  <p>Cimahi, {today ? formatDate(today) : ''}</p>
              </div>
              <div className="col-span-1 text-right">
                   <p>Dibuat di Cimahi, {today ? formatDate(today) : ''}</p>
              </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-8 text-xs">
              <div className="text-center">
                  <p>Yang Menerima</p>
                  <p className="mt-2">Tanda Tangan:</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">{penerima?.nama || "-"}</p>
                  <p>NIP: {penerima?.nip || "-"}</p>
                  <p>Pangkat/Gol: {penerima?.pangkat_golongan || "-"}</p>
              </div>
               <div className="text-center">
                  <p>Pengurus Barang Pengguna</p>
                   <p className="mt-2">Tanda Tangan:</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">{pengurusBarang.nama}</p>
                  <p>NIP: {pengurusBarang.nip}</p>
                  <p>Pangkat/Gol: {pengurusBarang.pangkat_golongan}</p>
              </div>
          </div>

          <div className="mt-6 flex justify-center text-xs">
               <div className="text-center">
                  <p>MENGETAHUI : KEPALA SUB BAGIAN TATA USAHA</p>
                   <p className="mt-2">Tanda Tangan:</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">{kasubag.nama}</p>                  <p>NIP: {kasubag.nip}</p>
                  <p>Pangkat/Gol: {kasubag.pangkat_golongan}</p>
              </div>
          </div>
        </div>

      </div>
       <style jsx global>{`
        @page {
            size: A4;
            margin: 1.5cm;
        }
        @media print {
          body {
            background-color: white;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-hidden {
            display: none;
          }
           body, .A4-sheet {
            font-size: 10px;
          }
          .A4-sheet {
            border: none;
            box-shadow: none;
            padding: 0;
            margin: 0;
            width: 100%;
            height: auto;
          }
          th, td {
            padding: 2px !important;
          }
          .signature-section {
            page-break-inside: avoid;
          }
          table {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
