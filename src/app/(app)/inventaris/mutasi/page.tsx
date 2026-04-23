
"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, FileDown, Search, Package, Landmark, PlusCircle, Save, RotateCcw, Info, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

// Types
interface MutationItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  initialQty: number;
  purchaseQty: number;
  usageQty: number;
}

interface UnitGroup {
  name: string;
  items: MutationItem[];
}

interface CategoryGroup {
  name: string;
  units: UnitGroup[];
}

interface MasterItem {
  item_id: number;
  item_name: string;
  nama_kategori: string;
  unit: string;
  unit_price: string;
  current_stock: number;
}

interface ItemCategory {
  id: number;
  nama_kategori: string;
}

interface WorkUnit {
  id: number;
  nama_unit: string;
}

interface InventoryTransaction {
  id: number;
  tanggal: string;
  tipe: string;
  sumber: string;
  qty: number;
  harga_satuan: string;
  total: string;
  nama_barang: string;
  kategori_barang: string;
  kategori_persediaan: string;
  unit_kerja: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

export default function MutasiPersediaanPage() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [reportData, setReportData] = useState<CategoryGroup[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Master Data from API
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const totalTransaksi = formData.qty * formData.harga_satuan;

  const fetchDataMaster = useCallback(async () => {
    setIsLoadingMaster(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items?page=1&limit=10000`, { headers });
      if (res.data.code === 200) setMasterItems(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMaster(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/item-categories`, { headers });
      if (res.data.code === 200) setCategories(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    setIsLoadingUnits(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/units`, { headers });
      if (res.data.code === 200) setWorkUnits(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingUnits(false);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    setIsLoadingReport(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory`, {
        params: {
          tipe: 'MASUK,KELUAR',
          start_date: startDate,
          end_date: endDate
        },
        headers
      });

      if (response.data.code === 200) {
        const transactions: InventoryTransaction[] = response.data.data;
        
        // Grouping Logic
        const grouped: Record<string, Record<string, Record<string, MutationItem>>> = {};

        transactions.forEach(tx => {
          const catName = tx.kategori_persediaan || "Lainnya";
          const unitName = tx.unit_kerja || "Tanpa Unit";
          const itemName = tx.nama_barang;

          if (!grouped[catName]) grouped[catName] = {};
          if (!grouped[catName][unitName]) grouped[catName][unitName] = {};
          
          if (!grouped[catName][unitName][itemName]) {
            grouped[catName][unitName][itemName] = {
              id: tx.id.toString(),
              name: itemName,
              unit: tx.kategori_barang, // Assumption based on API
              price: parseFloat(tx.harga_satuan),
              initialQty: 0,
              purchaseQty: 0,
              usageQty: 0
            };
          }

          const item = grouped[catName][unitName][itemName];
          if (tx.sumber === 'SALDO_AWAL') item.initialQty += tx.qty;
          if (tx.sumber === 'PEMBELIAN') item.purchaseQty += tx.qty;
          if (tx.sumber === 'PEMAKAIAN') item.usageQty += tx.qty;
        });

        // Convert to UI structure
        const finalReport: CategoryGroup[] = Object.keys(grouped).map(catName => ({
          name: catName,
          units: Object.keys(grouped[catName]).map(unitName => ({
            name: unitName,
            items: Object.values(grouped[catName][unitName])
          }))
        }));

        setReportData(finalReport);
        setExpandedCategories(finalReport.map(c => c.name));
        setExpandedUnits(finalReport.flatMap(c => c.units.map(u => `${c.name}-${u.name}`)));
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal memuat data mutasi." });
    } finally {
      setIsLoadingReport(false);
    }
  }, [startDate, endDate, toast]);

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchDataMaster();
  }, [fetchCategories, fetchUnits, fetchDataMaster]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const toggleUnit = (catName: string, unitName: string) => {
    const key = `${catName}-${unitName}`;
    setExpandedUnits(prev => 
      prev.includes(key) ? prev.filter(u => u !== key) : [...prev, key]
    );
  };

  const filteredData = useMemo(() => {
    return reportData.map(cat => {
      if (filterKategori !== "all" && cat.name !== filterKategori) return null;
      
      const filteredUnits = cat.units.map(unit => {
        if (filterUnit !== "all" && unit.name !== filterUnit) return null;
        
        const filteredItems = unit.items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filteredItems.length === 0 && searchTerm !== "") return null;
        
        return { ...unit, items: filteredItems };
      }).filter(u => u !== null) as UnitGroup[];

      if (filteredUnits.length === 0) return null;
      
      return { ...cat, units: filteredUnits };
    }).filter(c => c !== null) as CategoryGroup[];
  }, [reportData, filterKategori, filterUnit, searchTerm]);

  const calculateSubtotal = (items: MutationItem[]) => {
    return items.reduce((acc, item) => ({
      initialVal: acc.initialVal + (item.initialQty * item.price),
      purchaseVal: acc.purchaseVal + (item.purchaseQty * item.price),
      usageVal: acc.usageVal + (item.usageQty * item.price),
      finalVal: acc.finalVal + ((item.initialQty + item.purchaseQty - item.usageQty) * item.price)
    }), { initialVal: 0, purchaseVal: 0, usageVal: 0, finalVal: 0 });
  };

  const grandTotal = useMemo(() => {
    const allItems = filteredData.flatMap(c => c.units.flatMap(u => u.items));
    return calculateSubtotal(allItems);
  }, [filteredData]);

  const handleExportExcel = () => {
    const flatData: any[] = [];
    filteredData.forEach(cat => {
      cat.units.forEach(unit => {
        unit.items.forEach(item => {
          flatData.push({
            "Kategori": cat.name,
            "Unit Kerja": unit.name,
            "Nama Barang": item.name,
            "Satuan": item.unit,
            "Saldo Akhir Qty": item.initialQty + item.purchaseQty - item.usageQty,
            "Saldo Akhir Jml": (item.initialQty + item.purchaseQty - item.usageQty) * item.price
          });
        });
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mutasi");
    XLSX.writeFile(workbook, `Mutasi_${startDate}.xlsx`);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleBarangChange = (val: string) => {
    const selectedItem = masterItems.find(item => item.item_id.toString() === val);
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        barang_id: val,
        kategori: selectedItem.nama_kategori,
        harga_satuan: parseFloat(selectedItem.unit_price) || 0
      }));
    } else {
      handleInputChange('barang_id', val);
    }
  };

  const handleResetForm = () => {
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

  const handleSubmit = async () => {
    const errors: Record<string, boolean> = {};
    if (!formData.barang_id) errors.barang_id = true;
    if (!formData.kategori) errors.kategori = true;
    if (!formData.unit_kerja) errors.unit_kerja = true;
    if (formData.qty <= 0) errors.qty = true;
    if (formData.harga_satuan < 0) errors.harga_satuan = true;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ variant: "destructive", title: "Validasi Gagal", description: "Lengkapi semua field wajib." });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory`, {
        item_id: parseInt(formData.barang_id),
        unit_kerja: formData.unit_kerja,
        tipe: formData.tipe,
        sumber: formData.sumber,
        qty: formData.qty,
        harga_satuan: formData.harga_satuan,
        tanggal: formData.tanggal,
        keterangan: formData.keterangan
      }, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });

      toast({ variant: "success", title: "Berhasil!", description: "Transaksi persediaan telah disimpan." });
      setIsModalOpen(false);
      handleResetForm();
      fetchReportData();
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan transaksi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mutasi Persediaan</h1>
            <p className="text-sm text-muted-foreground">Laporan rincian mutasi barang persediaan berdasarkan kategori dan unit kerja.</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi Persediaan</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" /> Informasi Barang
                      </h4>
                      <div className="space-y-2">
                        <Label className={cn(formErrors.barang_id && "text-destructive")}>Nama Barang</Label>
                        <Select value={formData.barang_id} onValueChange={handleBarangChange}>
                          <SelectTrigger className={cn("w-full [&>span]:truncate [&>span]:text-left", formErrors.barang_id && "border-destructive")}>
                            <SelectValue placeholder={isLoadingMaster ? "Memuat..." : "Pilih Barang"} />
                          </SelectTrigger>
                          <SelectContent>
                            {masterItems.map(b => (
                              <SelectItem key={b.item_id} value={b.item_id.toString()}>
                                {b.item_name} ({b.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(formErrors.kategori && "text-destructive")}>Kategori</Label>
                        <Select value={formData.kategori} onValueChange={(val) => handleInputChange('kategori', val)}>
                          <SelectTrigger className={cn("w-full [&>span]:truncate [&>span]:text-left", formErrors.kategori && "border-destructive")}>
                            <SelectValue placeholder={isLoadingCategories ? "Memuat..." : "Pilih Kategori"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.nama_kategori}>
                                {cat.nama_kategori}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(formErrors.unit_kerja && "text-destructive")}>Unit Kerja</Label>
                        <Select value={formData.unit_kerja} onValueChange={(val) => handleInputChange('unit_kerja', val)}>
                          <SelectTrigger className={cn("w-full [&>span]:truncate [&>span]:text-left", formErrors.unit_kerja && "border-destructive")}>
                            <SelectValue placeholder={isLoadingUnits ? "Memuat..." : "Pilih Unit Kerja"} />
                          </SelectTrigger>
                          <SelectContent>
                            {workUnits.map(unit => (
                              <SelectItem key={unit.id} value={unit.nama_unit}>
                                {unit.nama_unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Info className="h-3.5 w-3.5" /> Informasi Transaksi
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Tipe</Label>
                          <Select value={formData.tipe} onValueChange={(val) => handleInputChange('tipe', val)}>
                            <SelectTrigger className="w-full text-left truncate [&>span]:line-clamp-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MASUK">MASUK</SelectItem>
                              <SelectItem value="KELUAR">KELUAR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Sumber</Label>
                          <Select value={formData.sumber} onValueChange={(val) => handleInputChange('sumber', val)}>
                            <SelectTrigger className="w-full text-left truncate [&>span]:line-clamp-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SALDO_AWAL">SALDO AWAL</SelectItem>
                              <SelectItem value="PEMBELIAN">PEMBELIAN</SelectItem>
                              <SelectItem value="PEMAKAIAN">PEMAKAIAN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className={cn(formErrors.qty && "text-destructive")}>Qty</Label>
                          <Input type="number" value={formData.qty} onChange={(e) => handleInputChange('qty', parseInt(e.target.value) || 0)} className={cn(formErrors.qty && "border-destructive")} />
                        </div>
                        <div className="space-y-2">
                          <Label className={cn(formErrors.harga_satuan && "text-destructive")}>Harga Satuan</Label>
                          <Input type="number" value={formData.harga_satuan} onChange={(e) => handleInputChange('harga_satuan', parseFloat(e.target.value) || 0)} className={cn(formErrors.harga_satuan && "border-destructive")} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal</Label>
                        <Input type="date" value={formData.tanggal} onChange={(e) => handleInputChange('tanggal', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Keterangan (Opsional)</Label>
                    <Textarea placeholder="Catatan tambahan transaksi..." value={formData.keterangan} onChange={(e) => handleInputChange('keterangan', e.target.value)} />
                  </div>
                  <div className="bg-slate-900 text-white p-4 rounded-lg flex justify-between items-center shadow-lg border border-slate-800">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Estimasi Total Nilai</p>
                      <p className="text-xl font-black text-amber-400">{formatCurrency(totalTransaksi)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" type="button" size="sm" onClick={handleResetForm} className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                      </Button>
                      <Button size="sm" type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-600">
                        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />} 
                        Simpan
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleExportExcel} variant="outline" className="border-success text-success hover:bg-success/10 shadow-sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 bg-slate-50/50 border-b">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-slate-500">Dari Tanggal</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="focus-visible:ring-primary h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-slate-500">Sampai Tanggal</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="focus-visible:ring-primary h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-slate-500">Kategori Belanja</Label>
                <Select value={isLoadingCategories ? "loading" : filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger className="w-full h-9 [&>span]:truncate [&>span]:text-left">
                    <SelectValue placeholder={isLoadingCategories ? "Memuat..." : "Semua Kategori"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loading" disabled className="hidden">Memuat...</SelectItem>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.nama_kategori}>{cat.nama_kategori}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-slate-500">Unit Kerja</Label>
                <Select value={isLoadingUnits ? "loading" : filterUnit} onValueChange={setFilterUnit}>
                  <SelectTrigger className="w-full h-9 [&>span]:truncate [&>span]:text-left">
                    <SelectValue placeholder={isLoadingUnits ? "Memuat..." : "Semua Unit Kerja"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loading" disabled className="hidden">Memuat...</SelectItem>
                    <SelectItem value="all">Semua Unit Kerja</SelectItem>
                    {workUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.nama_unit}>{unit.nama_unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-slate-500">Cari Barang</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nama barang..." 
                    className="pl-8 h-9 focus-visible:ring-primary" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Table */}
        <div className="rounded-xl border shadow-md overflow-x-auto bg-white overflow-hidden relative">
          {isLoadingReport && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Memuat Laporan...</span>
              </div>
            </div>
          )}
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                <TableHead rowSpan={2} className="w-[50px] text-center text-white border-r border-slate-700 font-bold">No</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] text-white border-r border-slate-700 font-bold">Nama Barang</TableHead>
                <TableHead rowSpan={2} className="w-[80px] text-center text-white border-r border-slate-700 font-bold">Satuan</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-slate-700 bg-blue-600/20 text-blue-100 font-bold py-2">SALDO AWAL</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-slate-700 bg-emerald-600/20 text-emerald-100 font-bold py-2">PEMBELIAN</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-slate-700 bg-rose-600/20 text-rose-100 font-bold py-2">PEMAKAIAN</TableHead>
                <TableHead colSpan={3} className="text-center bg-amber-600/20 text-amber-100 font-bold py-2">SALDO AKHIR</TableHead>
              </TableRow>
              <TableRow className="bg-slate-800 hover:bg-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-300">
                <TableHead className="text-center border-r border-slate-700">Qty</TableHead>
                <TableHead className="text-center border-r border-slate-700">Harga</TableHead>
                <TableHead className="text-center border-r border-slate-700">Jumlah</TableHead>
                <TableHead className="text-center border-r border-slate-700">Qty</TableHead>
                <TableHead className="text-center border-r border-slate-700">Harga</TableHead>
                <TableHead className="text-center border-r border-slate-700">Jumlah</TableHead>
                <TableHead className="text-center border-r border-slate-700">Qty</TableHead>
                <TableHead className="text-center border-r border-slate-700">Harga</TableHead>
                <TableHead className="text-center border-r border-slate-700">Jumlah</TableHead>
                <TableHead className="text-center border-r border-slate-700">Qty</TableHead>
                <TableHead className="text-center border-r border-slate-700">Harga</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="h-32 text-center text-slate-400 italic">Tidak ada data untuk periode ini.</TableCell>
                </TableRow>
              ) : filteredData.map((cat, catIdx) => {
                const isCatExpanded = expandedCategories.includes(cat.name);
                const catSubtotal = calculateSubtotal(cat.units.flatMap(u => u.items));
                
                return (
                  <React.Fragment key={cat.name}>
                    <TableRow 
                      className="bg-amber-50/80 hover:bg-amber-100/80 cursor-pointer transition-colors border-l-4 border-l-amber-500"
                      onClick={() => toggleCategory(cat.name)}
                    >
                      <TableCell className="text-center border-r border-amber-100 font-black text-amber-900">{catIdx + 1}</TableCell>
                      <TableCell colSpan={2} className="border-r border-amber-100 font-black text-amber-900">
                        <div className="flex items-center gap-2">
                          <div className="bg-amber-500 rounded-md p-1">
                            {isCatExpanded ? <ChevronDown className="h-3 w-3 text-white" /> : <ChevronRight className="h-3 w-3 text-white" />}
                          </div>
                          <Landmark className="h-4 w-4 opacity-50" />
                          <span className="uppercase">{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-amber-100" colSpan={2}></TableCell>
                      <TableCell className="text-right border-r border-amber-100 font-bold text-blue-700 text-xs">{formatCurrency(catSubtotal.initialVal)}</TableCell>
                      <TableCell className="border-r border-amber-100" colSpan={2}></TableCell>
                      <TableCell className="text-right border-r border-amber-100 font-bold text-emerald-700 text-xs">{formatCurrency(catSubtotal.purchaseVal)}</TableCell>
                      <TableCell className="border-r border-amber-100" colSpan={2}></TableCell>
                      <TableCell className="text-right border-r border-amber-100 font-bold text-rose-700 text-xs">{formatCurrency(catSubtotal.usageVal)}</TableCell>
                      <TableCell className="border-r border-amber-100" colSpan={2}></TableCell>
                      <TableCell className="text-right font-black text-amber-700 text-sm">{formatCurrency(catSubtotal.finalVal)}</TableCell>
                    </TableRow>

                    {isCatExpanded && cat.units.map((unit) => {
                      const unitKey = `${cat.name}-${unit.name}`;
                      const isUnitExpanded = expandedUnits.includes(unitKey);
                      const unitSubtotal = calculateSubtotal(unit.items);

                      return (
                        <React.Fragment key={unitKey}>
                          <TableRow 
                            className="bg-indigo-50/30 hover:bg-indigo-50 cursor-pointer transition-colors border-l-4 border-l-indigo-400"
                            onClick={() => toggleUnit(cat.name, unit.name)}
                          >
                            <TableCell className="border-r border-indigo-100"></TableCell>
                            <TableCell colSpan={2} className="border-r border-indigo-100 pl-8 font-bold text-indigo-900">
                              <div className="flex items-center gap-2">
                                {isUnitExpanded ? <ChevronDown className="h-3 w-3 opacity-50" /> : <ChevronRight className="h-3 w-3 opacity-50" />}
                                {unit.name}
                              </div>
                            </TableCell>
                            <TableCell className="border-r border-indigo-100" colSpan={2}></TableCell>
                            <TableCell className="text-right border-r border-indigo-100 font-bold text-indigo-600/70 text-[10px] italic">{formatCurrency(unitSubtotal.initialVal)}</TableCell>
                            <TableCell className="border-r border-indigo-100" colSpan={2}></TableCell>
                            <TableCell className="text-right border-r border-indigo-100 font-bold text-indigo-600/70 text-[10px] italic">{formatCurrency(unitSubtotal.purchaseVal)}</TableCell>
                            <TableCell className="border-r border-indigo-100" colSpan={2}></TableCell>
                            <TableCell className="text-right border-r border-indigo-100 font-bold text-indigo-600/70 text-[10px] italic">{formatCurrency(unitSubtotal.usageVal)}</TableCell>
                            <TableCell className="border-r border-indigo-100" colSpan={2}></TableCell>
                            <TableCell className="text-right font-bold text-indigo-700 text-xs">{formatCurrency(unitSubtotal.finalVal)}</TableCell>
                          </TableRow>

                          {isUnitExpanded && unit.items.map((item, itemIdx) => {
                            const finalQty = item.initialQty + item.purchaseQty - item.usageQty;
                            return (
                              <TableRow key={`${unitKey}-${item.name}`} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="border-r border-slate-100 text-center text-[10px] text-muted-foreground">{catIdx + 1}.{itemIdx + 1}</TableCell>
                                <TableCell className="border-r border-slate-100 pl-12 text-sm text-slate-700 font-medium">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-3 w-3 opacity-30" />
                                    {item.name}
                                  </div>
                                </TableCell>
                                <TableCell className="border-r border-slate-100 text-center text-xs font-semibold text-slate-500">{item.unit}</TableCell>
                                <TableCell className="border-r border-slate-100 text-center bg-blue-50/30 font-medium">{item.initialQty}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-[10px] text-slate-400 italic bg-blue-50/30">{formatNumber(item.price)}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-xs font-semibold text-blue-600 bg-blue-50/30">{formatCurrency(item.initialQty * item.price)}</TableCell>
                                <TableCell className="border-r border-slate-100 text-center bg-emerald-50/30 font-medium">{item.purchaseQty}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-[10px] text-slate-400 italic bg-emerald-50/30">{formatNumber(item.price)}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-xs font-semibold text-emerald-600 bg-emerald-50/30">{formatCurrency(item.purchaseQty * item.price)}</TableCell>
                                <TableCell className="border-r border-slate-100 text-center bg-rose-50/30 font-medium">{item.usageQty}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-[10px] text-slate-400 italic bg-rose-50/30">{formatNumber(item.price)}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-xs font-semibold text-rose-600 bg-rose-50/30">{formatCurrency(item.usageQty * item.price)}</TableCell>
                                <TableCell className="border-r border-slate-100 text-center font-black bg-amber-50/30 text-amber-900">{finalQty}</TableCell>
                                <TableCell className="border-r border-slate-100 text-right text-[10px] text-slate-400 italic bg-amber-50/30">{formatNumber(item.price)}</TableCell>
                                <TableCell className="text-right text-xs font-black bg-amber-50/30 text-amber-700">{formatCurrency(finalQty * item.price)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {filteredData.length > 0 && (
                <TableRow className="bg-primary hover:bg-primary/95 text-white shadow-inner">
                  <TableCell colSpan={3} className="text-center font-black text-lg border-r border-white/10 py-6 tracking-widest">GRAND TOTAL</TableCell>
                  <TableCell className="border-r border-white/10" colSpan={2}></TableCell>
                  <TableCell className="text-right border-r border-white/10 font-bold text-sm">{formatCurrency(grandTotal.initialVal)}</TableCell>
                  <TableCell className="border-r border-white/10" colSpan={2}></TableCell>
                  <TableCell className="text-right border-r border-white/10 font-bold text-sm">{formatCurrency(grandTotal.purchaseVal)}</TableCell>
                  <TableCell className="border-r border-white/10" colSpan={2}></TableCell>
                  <TableCell className="text-right border-r border-white/10 font-bold text-sm">{formatCurrency(grandTotal.usageVal)}</TableCell>
                  <TableCell className="border-r border-white/10" colSpan={2}></TableCell>
                  <TableCell className="text-right font-black text-xl py-6 underline decoration-white/30 underline-offset-8">{formatCurrency(grandTotal.finalVal)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
