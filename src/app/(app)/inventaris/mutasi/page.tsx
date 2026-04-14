
"use client"

import React, { useState, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, FileDown, Loader2, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

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

// Dummy Data
const DUMMY_MUTATION_DATA: CategoryGroup[] = [
  {
    name: "Alat Tulis Kantor",
    units: [
      {
        name: "Sekretariat",
        items: [
          { id: "1", name: "Pulpen Boxy", unit: "Pcs", price: 15000, initialQty: 10, purchaseQty: 50, usageQty: 40 },
          { id: "2", name: "Kertas A4 80gr", unit: "Rim", price: 55000, initialQty: 5, purchaseQty: 20, usageQty: 15 },
        ]
      },
      {
        name: "Bidang 1",
        items: [
          { id: "3", name: "Spidol Whiteboard", unit: "Buah", price: 12000, initialQty: 20, purchaseQty: 30, usageQty: 45 },
        ]
      }
    ]
  },
  {
    name: "Bahan Pembersih",
    units: [
      {
        name: "Sekretariat",
        items: [
          { id: "4", name: "Sabun Cuci Tangan", unit: "Botol", price: 25000, initialQty: 8, purchaseQty: 12, usageQty: 10 },
        ]
      },
      {
        name: "Bidang 2",
        items: [
          { id: "5", name: "Pembersih Lantai", unit: "Galon", price: 85000, initialQty: 2, purchaseQty: 5, usageQty: 4 },
        ]
      }
    ]
  },
  {
    name: "Elektronik",
    units: [
      {
        name: "Sekretariat",
        items: [
          { id: "6", name: "Baterai AA", unit: "Pack", price: 35000, initialQty: 15, purchaseQty: 10, usageQty: 20 },
        ]
      }
    ]
  }
];

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
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>(DUMMY_MUTATION_DATA.map(c => c.name));
  const [expandedUnits, setExpandedUnits] = useState<string[]>(DUMMY_MUTATION_DATA.flatMap(c => c.units.map(u => `${c.name}-${u.name}`)));

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
    return DUMMY_MUTATION_DATA.map(cat => {
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
  }, [filterKategori, filterUnit, searchTerm]);

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
      flatData.push({ "Kategori": cat.name, "Nama Barang": "", "Satuan": "", "Saldo Awal Qty": "", "Saldo Awal Jml": "", "Pembelian Qty": "", "Pembelian Jml": "", "Pemakaian Qty": "", "Pemakaian Jml": "", "Saldo Akhir Qty": "", "Saldo Akhir Jml": "" });
      
      cat.units.forEach(unit => {
        flatData.push({ "Kategori": "", "Unit Kerja": unit.name, "Nama Barang": "", "Satuan": "", "Saldo Awal Qty": "", "Saldo Awal Jml": "", "Pembelian Qty": "", "Pembelian Jml": "", "Pemakaian Qty": "", "Pemakaian Jml": "", "Saldo Akhir Qty": "", "Saldo Akhir Jml": "" });
        
        unit.items.forEach(item => {
          const finalQty = item.initialQty + item.purchaseQty - item.usageQty;
          flatData.push({
            "Kategori": "",
            "Unit Kerja": "",
            "Nama Barang": item.name,
            "Satuan": item.unit,
            "Saldo Awal Qty": item.initialQty,
            "Saldo Awal Jml": item.initialQty * item.price,
            "Pembelian Qty": item.purchaseQty,
            "Pembelian Jml": item.purchaseQty * item.price,
            "Pemakaian Qty": item.usageQty,
            "Pemakaian Jml": item.usageQty * item.price,
            "Saldo Akhir Qty": finalQty,
            "Saldo Akhir Jml": finalQty * item.price
          });
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mutasi Persediaan");
    XLSX.writeFile(workbook, `Mutasi_Persediaan_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Mutasi Persediaan</h1>
          <Button onClick={handleExportExcel} className="bg-success hover:bg-success/90">
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Dari Tanggal</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sampai Tanggal</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kategori Belanja</Label>
                <Select value={filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="Alat Tulis Kantor">Alat Tulis Kantor</SelectItem>
                    <SelectItem value="Bahan Pembersih">Bahan Pembersih</SelectItem>
                    <SelectItem value="Elektronik">Elektronik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit Kerja</Label>
                <Select value={filterUnit} onValueChange={setFilterUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Unit Kerja</SelectItem>
                    <SelectItem value="Sekretariat">Sekretariat</SelectItem>
                    <SelectItem value="Bidang 1">Bidang 1</SelectItem>
                    <SelectItem value="Bidang 2">Bidang 2</SelectItem>
                    <SelectItem value="Bidang 3">Bidang 3</SelectItem>
                    <SelectItem value="Bidang 4">Bidang 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cari Barang</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nama barang..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Table */}
        <div className="rounded-md border overflow-x-auto bg-white">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead rowSpan={2} className="w-[50px] text-center border-r">No</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">Nama Barang</TableHead>
                <TableHead rowSpan={2} className="w-[80px] text-center border-r">Satuan</TableHead>
                <TableHead colSpan={3} className="text-center border-r bg-blue-50/50">SALDO AWAL</TableHead>
                <TableHead colSpan={3} className="text-center border-r bg-green-50/50">PEMBELIAN</TableHead>
                <TableHead colSpan={3} className="text-center border-r bg-red-50/50">PEMAKAIAN</TableHead>
                <TableHead colSpan={3} className="text-center bg-orange-50/50">SALDO AKHIR</TableHead>
              </TableRow>
              <TableRow className="bg-muted/50 text-[10px] uppercase font-bold">
                {/* Saldo Awal */}
                <TableHead className="text-center border-r">Qty</TableHead>
                <TableHead className="text-center border-r">Harga</TableHead>
                <TableHead className="text-center border-r">Jumlah</TableHead>
                {/* Pembelian */}
                <TableHead className="text-center border-r">Qty</TableHead>
                <TableHead className="text-center border-r">Harga</TableHead>
                <TableHead className="text-center border-r">Jumlah</TableHead>
                {/* Pemakaian */}
                <TableHead className="text-center border-r">Qty</TableHead>
                <TableHead className="text-center border-r">Harga</TableHead>
                <TableHead className="text-center border-r">Jumlah</TableHead>
                {/* Saldo Akhir */}
                <TableHead className="text-center border-r">Qty</TableHead>
                <TableHead className="text-center border-r">Harga</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((cat, catIdx) => {
                const isCatExpanded = expandedCategories.includes(cat.name);
                const catSubtotal = calculateSubtotal(cat.units.flatMap(u => u.items));
                
                return (
                  <React.Fragment key={cat.name}>
                    {/* Category Row */}
                    <TableRow 
                      className="bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                      onClick={() => toggleCategory(cat.name)}
                    >
                      <TableCell className="text-center border-r font-bold">{catIdx + 1}</TableCell>
                      <TableCell colSpan={2} className="border-r font-bold">
                        <div className="flex items-center gap-2">
                          {isCatExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          {cat.name} (KATEGORI)
                        </div>
                      </TableCell>
                      {/* Subtotal columns */}
                      <TableCell className="border-r" colSpan={2}></TableCell>
                      <TableCell className="text-right border-r font-bold">{formatCurrency(catSubtotal.initialVal)}</TableCell>
                      <TableCell className="border-r" colSpan={2}></TableCell>
                      <TableCell className="text-right border-r font-bold">{formatCurrency(catSubtotal.purchaseVal)}</TableCell>
                      <TableCell className="border-r" colSpan={2}></TableCell>
                      <TableCell className="text-right border-r font-bold">{formatCurrency(catSubtotal.usageVal)}</TableCell>
                      <TableCell className="border-r" colSpan={2}></TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(catSubtotal.finalVal)}</TableCell>
                    </TableRow>

                    {isCatExpanded && cat.units.map((unit) => {
                      const unitKey = `${cat.name}-${unit.name}`;
                      const isUnitExpanded = expandedUnits.includes(unitKey);
                      const unitSubtotal = calculateSubtotal(unit.items);

                      return (
                        <React.Fragment key={unitKey}>
                          {/* Unit Row */}
                          <TableRow 
                            className="bg-slate-100 hover:bg-slate-200 cursor-pointer"
                            onClick={() => toggleUnit(cat.name, unit.name)}
                          >
                            <TableCell className="border-r"></TableCell>
                            <TableCell colSpan={2} className="border-r pl-8 font-semibold">
                              <div className="flex items-center gap-2">
                                {isUnitExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                {unit.name}
                              </div>
                            </TableCell>
                            <TableCell className="border-r" colSpan={2}></TableCell>
                            <TableCell className="text-right border-r font-semibold">{formatCurrency(unitSubtotal.initialVal)}</TableCell>
                            <TableCell className="border-r" colSpan={2}></TableCell>
                            <TableCell className="text-right border-r font-semibold">{formatCurrency(unitSubtotal.purchaseVal)}</TableCell>
                            <TableCell className="border-r" colSpan={2}></TableCell>
                            <TableCell className="text-right border-r font-semibold">{formatCurrency(unitSubtotal.usageVal)}</TableCell>
                            <TableCell className="border-r" colSpan={2}></TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(unitSubtotal.finalVal)}</TableCell>
                          </TableRow>

                          {/* Item Rows */}
                          {isUnitExpanded && unit.items.map((item, itemIdx) => {
                            const finalQty = item.initialQty + item.purchaseQty - item.usageQty;
                            return (
                              <TableRow key={item.id} className="hover:bg-muted/30">
                                <TableCell className="border-r text-center text-xs text-muted-foreground">{catIdx + 1}.{itemIdx + 1}</TableCell>
                                <TableCell className="border-r pl-12 text-sm">{item.name}</TableCell>
                                <TableCell className="border-r text-center text-sm">{item.unit}</TableCell>
                                
                                {/* Saldo Awal */}
                                <TableCell className="border-r text-center">{item.initialQty}</TableCell>
                                <TableCell className="border-r text-right text-xs">{formatNumber(item.price)}</TableCell>
                                <TableCell className="border-r text-right text-sm">{formatCurrency(item.initialQty * item.price)}</TableCell>
                                
                                {/* Pembelian */}
                                <TableCell className="border-r text-center">{item.purchaseQty}</TableCell>
                                <TableCell className="border-r text-right text-xs">{formatNumber(item.price)}</TableCell>
                                <TableCell className="border-r text-right text-sm">{formatCurrency(item.purchaseQty * item.price)}</TableCell>
                                
                                {/* Pemakaian */}
                                <TableCell className="border-r text-center">{item.usageQty}</TableCell>
                                <TableCell className="border-r text-right text-xs">{formatNumber(item.price)}</TableCell>
                                <TableCell className="border-r text-right text-sm">{formatCurrency(item.usageQty * item.price)}</TableCell>
                                
                                {/* Saldo Akhir */}
                                <TableCell className="border-r text-center font-medium">{finalQty}</TableCell>
                                <TableCell className="border-r text-right text-xs">{formatNumber(item.price)}</TableCell>
                                <TableCell className="text-right text-sm font-medium">{formatCurrency(finalQty * item.price)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Grand Total Row */}
              <TableRow className="bg-slate-900 text-white hover:bg-slate-800">
                <TableCell colSpan={3} className="text-center font-bold text-lg border-r">GRAND TOTAL</TableCell>
                <TableCell className="border-r" colSpan={2}></TableCell>
                <TableCell className="text-right border-r font-bold">{formatCurrency(grandTotal.initialVal)}</TableCell>
                <TableCell className="border-r" colSpan={2}></TableCell>
                <TableCell className="text-right border-r font-bold">{formatCurrency(grandTotal.purchaseVal)}</TableCell>
                <TableCell className="border-r" colSpan={2}></TableCell>
                <TableCell className="text-right border-r font-bold">{formatCurrency(grandTotal.usageVal)}</TableCell>
                <TableCell className="border-r" colSpan={2}></TableCell>
                <TableCell className="text-right font-bold text-lg">{formatCurrency(grandTotal.finalVal)}</TableCell>
              </TableRow>
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
