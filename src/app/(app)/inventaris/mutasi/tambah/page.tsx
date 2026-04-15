
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, RotateCcw, Package, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Dummy Data for Dropdowns
const DUMMY_BARANG = [
  { id: "1", name: "Pulpen Boxy" },
  { id: "2", name: "Kertas A4 80gr" },
  { id: "3", name: "Spidol Whiteboard" },
  { id: "4", name: "Sabun Cuci Tangan" },
  { id: "5", name: "Pembersih Lantai" },
  { id: "6", name: "Baterai AA" },
];

const DUMMY_KATEGORI = [
  "Alat Tulis Kantor",
  "Bahan Pembersih",
  "Elektronik",
  "Lainnya"
];

const DUMMY_UNIT_KERJA = [
  "Sekretariat",
  "Bidang 1",
  "Bidang 2",
  "Bidang 3",
  "Bidang 4"
];

export default function TambahTransaksiMutasiPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    barang_id: "",
    kategori: "",
    unit_kerja: "",
    tipe: "MASUK",
    sumber: "PEMBELIAN",
    qty: 0,
    harga_satuan: 0,
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    keterangan: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed Field: Total
  const total = formData.qty * formData.harga_satuan;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleReset = () => {
    setFormData({
      barang_id: "",
      kategori: "",
      unit_kerja: "",
      tipe: "MASUK",
      sumber: "PEMBELIAN",
      qty: 0,
      harga_satuan: 0,
      tanggal: format(new Date(), 'yyyy-MM-dd'),
      keterangan: ""
    });
    setFormErrors({});
  };

  const validate = () => {
    const errors: Record<string, boolean> = {};
    if (!formData.barang_id) errors.barang_id = true;
    if (!formData.kategori) errors.kategori = true;
    if (!formData.unit_kerja) errors.unit_kerja = true;
    if (!formData.tipe) errors.tipe = true;
    if (!formData.sumber) errors.sumber = true;
    if (formData.qty <= 0) errors.qty = true;
    if (formData.harga_satuan < 0) errors.harga_satuan = true;
    if (!formData.tanggal) errors.tanggal = true;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Harap periksa kembali isian Anda. Pastikan semua field wajib terisi dengan benar."
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        variant: "success",
        title: "Berhasil!",
        description: "Transaksi persediaan telah berhasil disimpan ke database."
      });
      handleReset();
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tambah Transaksi Persediaan</h1>
            <p className="text-sm text-muted-foreground">Catat transaksi masuk atau keluar barang persediaan baru.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bagian 1: Informasi Barang */}
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informasi Barang
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barang" className={cn(formErrors.barang_id && "text-destructive")}>Nama Barang</Label>
                  <Select value={formData.barang_id} onValueChange={(val) => handleInputChange('barang_id', val)}>
                    <SelectTrigger className={cn(formErrors.barang_id && "border-destructive")}>
                      <SelectValue placeholder="Pilih Barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_BARANG.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kategori" className={cn(formErrors.kategori && "text-destructive")}>Kategori Persediaan</Label>
                  <Select value={formData.kategori} onValueChange={(val) => handleInputChange('kategori', val)}>
                    <SelectTrigger className={cn(formErrors.kategori && "border-destructive")}>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_KATEGORI.map(k => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_kerja" className={cn(formErrors.unit_kerja && "text-destructive")}>Unit Kerja Terkait</Label>
                  <Select value={formData.unit_kerja} onValueChange={(val) => handleInputChange('unit_kerja', val)}>
                    <SelectTrigger className={cn(formErrors.unit_kerja && "border-destructive")}>
                      <SelectValue placeholder="Pilih Unit Kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_UNIT_KERJA.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bagian 2: Informasi Transaksi */}
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Informasi Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipe">Tipe Transaksi</Label>
                    <Select value={formData.tipe} onValueChange={(val) => handleInputChange('tipe', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASUK">MASUK</SelectItem>
                        <SelectItem value="KELUAR">KELUAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sumber">Sumber Dana / Transaksi</Label>
                    <Select value={formData.sumber} onValueChange={(val) => handleInputChange('sumber', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALDO_AWAL">SALDO AWAL</SelectItem>
                        <SelectItem value="PEMBELIAN">PEMBELIAN</SelectItem>
                        <SelectItem value="PEMAKAIAN">PEMAKAIAN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty" className={cn(formErrors.qty && "text-destructive")}>Jumlah (Qty)</Label>
                    <Input 
                      id="qty" 
                      type="number" 
                      min="1" 
                      value={formData.qty} 
                      onChange={(e) => handleInputChange('qty', parseInt(e.target.value) || 0)}
                      className={cn(formErrors.qty && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harga" className={cn(formErrors.harga_satuan && "text-destructive")}>Harga Satuan (Rp)</Label>
                    <Input 
                      id="harga" 
                      type="number" 
                      min="0" 
                      value={formData.harga_satuan} 
                      onChange={(e) => handleInputChange('harga_satuan', parseInt(e.target.value) || 0)}
                      className={cn(formErrors.harga_satuan && "border-destructive")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal Transaksi</Label>
                  <Input 
                    id="tanggal" 
                    type="date" 
                    value={formData.tanggal} 
                    onChange={(e) => handleInputChange('tanggal', e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                  <Textarea 
                    id="keterangan" 
                    placeholder="Contoh: Pengadaan stok ATK triwulan I" 
                    value={formData.keterangan}
                    onChange={(e) => handleInputChange('keterangan', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Computed Summary Card */}
          <Card className="bg-slate-900 text-white shadow-lg border-none">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Nilai Transaksi</p>
                <h3 className="text-3xl font-black text-amber-400">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}
                </h3>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 flex-1"
                  onClick={handleReset}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Transaksi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>

      <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm">
        <Card className="rounded-none border-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
            <div className="p-4 text-center text-sm text-muted-foreground">
                <p>© 2026 BPSDM Provinsi Jawa Barat. Developed by Irfan Irawan Sukirman. SIMANJA. All rights reserved.</p>
            </div>
        </Card>
      </footer>
    </div>
  );
}
