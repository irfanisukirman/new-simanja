
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, PlusCircle, Trash2, FileDown, Loader2, Search, FileUp } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Item {
    item_id: number;
    item_code: string;
    item_name: string;
    category_id: number;
    category_name: string;
    unit: string;
    procurement_date: string;
    initial_stock: number;
    current_stock: number;
    unit_price: string;
    status: string;
    remarks?: string;
}

interface Category {
    category_id: number;
    category_name: string;
}

const ITEMS_PER_PAGE = 10;

const formatCurrency = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return "-";
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(numericValue);
}

const getStatusBadge = (status: string) => {
  if (!status) return null;
  switch (status.toLowerCase()) {
    case 'kosong':
      return <Badge variant="destructive">Kosong</Badge>;
    case 'stok_lama':
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Stok Lama</Badge>;
    case 'stok_baru':
      return <Badge className="bg-green-500 text-white hover:bg-green-600">Stok Baru</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatStatusForExport = (status: string) => {
  if (!status) return "-";
  switch (status.toLowerCase()) {
    case 'kosong':
      return 'Kosong';
    case 'stok_lama':
      return 'Stok Lama';
    case 'stok_baru':
      return 'Stok Baru';
    default:
      return status;
  }
};

const exportColumnsDefault = {
  item_code: { label: "Kode Barang", selected: true },
  item_name: { label: "Nama Barang", selected: true },
  category_name: { label: "Kategori", selected: true },
  unit: { label: "Satuan", selected: true },
  procurement_date: { label: "Tgl. Pengadaan", selected: true },
  initial_stock: { label: "Stok Awal", selected: true },
  current_stock: { label: "Stok Saat Ini", selected: true },
  unit_price: { label: "Harga Satuan", selected: true },
  status: { label: "Status", selected: true },
}

const months = [
  { value: "0", label: "Januari" }, { value: "1", label: "Februari" },
  { value: "2", label: "Maret" }, { value: "3", label: "April" },
  { value: "4", label: "Mei" }, { value: "5", label: "Juni" },
  { value: "6", label: "Juli" }, { value: "7", label: "Agustus" },
  { value: "8", label: "September" }, { value: "9", label: "Oktober" },
  { value: "10", label: "November" }, { value: "11", label: "Desember" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 21 }, (_, i) => (currentYear - 10 + i).toString());

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function MasterDataBarangPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFileName, setExportFileName] = useState("data_barang");
  const [selectedExportColumns, setSelectedExportColumns] = useState(exportColumnsDefault);
  const [editedItemData, setEditedItemData] = useState<Partial<Item>>({});
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [newItemData, setNewItemData] = useState({
    item_name: "",
    category_id: "",
    unit: "",
    initial_stock: "",
    unit_price: "",
    remarks: "Saldo awal tahun"
  });
  const [newDate, setNewDate] = useState<Date>(new Date());

  const handleApiError = useCallback((error: any, context: string = "general") => {
    if (error.response?.status === 401) {
        toast({
            variant: "destructive",
            title: "Sesi Habis",
            description: "Sesi Anda telah berakhir. Silakan login kembali.",
        });
        localStorage.clear();
        window.location.href = "/login";
        return true;
    }
    
    toast({
      variant: "destructive",
      title: `Terjadi Kesalahan - ${context}`,
      description: error.response?.data?.message || "Tidak dapat terhubung ke server.",
    });

    return false;
  }, [toast]);
  
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/categories`, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        });
        setCategories(response.data.data || []);
    } catch (error: any) {
        handleApiError(error, "Fetch Kategori");
    } finally {
        setIsLoadingCategories(false);
    }
  }, [handleApiError]);

  const fetchData = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
        
        const url = search 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/search?keyword=${search}&page=${page}&limit=${ITEMS_PER_PAGE}`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items?page=${page}&limit=${ITEMS_PER_PAGE}`;
        
        const response = await axios.get(url, { headers });

        setItems(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 0);

    } catch (error: any) {
         handleApiError(error, "Fetch Data");
    } finally {
        setIsLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchData(currentPage, searchKeyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword, currentPage, fetchData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (item: Item) => {
    setSelectedItem(item);
    setEditedItemData({ 
        ...item,
        category_id: item.category_id,
        unit_price: String(Math.floor(parseFloat(item.unit_price)))
    });
    if (item.procurement_date) {
        setDate(new Date(item.procurement_date));
    } else {
        setDate(new Date());
    }
    setIsEditDialogOpen(true);
  };

  const handleEditFormChange = (field: keyof Item, value: any) => {
    setEditedItemData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItemFormChange = (field: string, value: any) => {
    setNewItemData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = event.target.value;
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleDelete = async (itemId: number) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });

      toast({
        variant: "success",
        title: "Berhasil!",
        description: "Barang telah berhasil dihapus.",
      });

      fetchData(currentPage, searchKeyword);

    } catch (error: any) {
      handleApiError(error, "Delete Item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);
    try {
        const token = localStorage.getItem("token");
        const payload = {
            item_name: editedItemData.item_name,
            category_id: parseInt(String(editedItemData.category_id)),
            unit: editedItemData.unit,
            procurement_date: date ? format(date, "yyyy-MM-dd") : undefined,
            initial_stock: parseInt(String(editedItemData.initial_stock)),
            unit_price: parseInt(String(editedItemData.unit_price)),
            remarks: editedItemData.remarks
        };

        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/${selectedItem.item_id}`, payload, {
             headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        });

        toast({
            variant: "success",
            title: "Berhasil!",
            description: "Barang telah berhasil diperbarui.",
        });
        
        setIsEditDialogOpen(false);
        fetchData(currentPage, searchKeyword); 

    } catch (error: any) {
        handleApiError(error, "Update Item");
    } finally {
        setIsUpdating(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemData.item_name || !newItemData.category_id || !newItemData.unit || !newItemData.initial_stock || !newItemData.unit_price) {
      toast({
        variant: "destructive",
        title: "Input Tidak Lengkap",
        description: "Harap isi semua kolom yang wajib diisi.",
      });
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        item_name: newItemData.item_name,
        category_id: parseInt(newItemData.category_id),
        unit: newItemData.unit,
        procurement_date: format(newDate, "yyyy-MM-dd"),
        initial_stock: parseInt(newItemData.initial_stock),
        unit_price: parseInt(newItemData.unit_price),
        remarks: newItemData.remarks
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });

      toast({
        variant: "success",
        title: "Berhasil!",
        description: "Barang baru berhasil ditambahkan.",
      });

      setIsAddDialogOpen(false);
      fetchData(1, searchKeyword);
      setNewItemData({
        item_name: "",
        category_id: "",
        unit: "",
        initial_stock: "",
        unit_price: "",
        remarks: "Saldo awal tahun"
      });
      setNewDate(new Date());

    } catch (error: any) {
      handleApiError(error, "Tambah Barang");
    } finally {
      setIsAdding(false);
    }
  };

  const handleExportColumnChange = (column: keyof typeof exportColumnsDefault) => {
    setSelectedExportColumns(prev => ({
      ...prev,
      [column]: { ...prev[column], selected: !prev[column].selected }
    }))
  }

  const handleExport = async () => {
    if (isExporting) return;

    const activeColumns = Object.entries(selectedExportColumns).filter(([, val]) => val.selected);
    if (activeColumns.length === 0) {
      toast({
        variant: "destructive",
        title: "Tidak ada kolom terpilih",
        description: "Silakan pilih setidaknya satu kolom untuk diekspor."
      });
      return;
    }

    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items?limit=9999`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      const allItems = response.data.data;

      const dataToExport = allItems.map((item: Item) => {
        const row: { [key: string]: any } = {};
        for (const [key, value] of activeColumns) {
           if (key === 'procurement_date' && item.procurement_date) {
             row[value.label] = format(new Date(item.procurement_date), "dd-MM-yyyy");
           } else if (key === 'unit_price') {
              row[value.label] = parseInt(item.unit_price)
           } else if (key === 'status') {
             row[value.label] = formatStatusForExport(item.status);
           }
           else {
             row[value.label] = item[key as keyof Item] || '-';
           }
        }
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Barang");
      XLSX.writeFile(workbook, `${exportFileName || 'data_barang'}.xlsx`);

      toast({
        variant: "success",
        title: "Ekspor Berhasil",
        description: "Data barang telah berhasil diekspor ke Excel.",
      });
      setIsExportDialogOpen(false);

    } catch (error: any) {
       handleApiError(error, "Export Data");
    } finally {
      setIsExporting(false);
    }
  }

  const handleDateChange = (target: 'edit' | 'add', part: 'day' | 'month' | 'year', value: string) => {
    const currentDate = (target === 'edit' ? date : newDate) || new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    if (part === 'day') day = parseInt(value);
    if (part === 'month') month = parseInt(value);
    if (part === 'year') year = parseInt(value);

    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) day = daysInMonth;
    
    const nextDate = new Date(year, month, day);
    if (target === 'edit') setDate(nextDate);
    else setNewDate(nextDate);
  };

  const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 10) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let i = -2; i <= 2; i++) {
        const page = currentPage + i;
        if (page > 1 && page < totalPages) pages.add(page);
    }
    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const paginatedItems: (number | string)[] = [];
    let lastPage = 0;
    for (const page of sortedPages) {
        if (lastPage !== 0 && page - lastPage > 1) paginatedItems.push('...');
        paginatedItems.push(page);
        lastPage = page;
    }
    return paginatedItems;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImportFile(file);
    } else {
        setImportFile(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    toast({ title: "Fitur Dalam Pengembangan", description: `Memproses file: ${importFile.name}` });
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Master Data Barang</h1>
        </div>
         <div className="flex justify-between items-center pt-2 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama..."
                  className="w-full md:w-[500px] pl-10"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                />
            </div>
            <div className="flex gap-2">
                 <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><FileUp className="mr-2 h-4 w-4" />Import</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import Data Barang</DialogTitle>
                       <DialogDescription>Pilih file Excel (.xlsx, .xls) atau .csv.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input id="import-file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
                        {importFile && <div className="text-sm text-muted-foreground">File terpilih: <span className="font-medium text-foreground">{importFile.name}</span></div>}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                      <Button onClick={handleImport} disabled={!importFile}>Import</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><FileDown className="mr-2 h-4 w-4" />Export</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Export Data Barang ke Excel</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 items-center gap-2">
                        <Label htmlFor="export-filename">Nama File</Label>
                        <Input id="export-filename" value={exportFileName} onChange={(e) => setExportFileName(e.target.value)} />
                      </div>
                       <div className="grid grid-cols-1 items-center gap-2">
                          <Label>Pilih Kolom</Label>
                          <div className="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-48 overflow-y-auto">
                            {Object.entries(selectedExportColumns).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox id={`col-${key}`} checked={value.selected} onCheckedChange={() => handleExportColumnChange(key as keyof typeof exportColumnsDefault)} />
                                <Label htmlFor={`col-${key}`} className="font-normal cursor-pointer text-sm">{value.label}</Label>
                              </div>
                            ))}
                          </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                      <Button onClick={handleExport} disabled={isExporting}>Export</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Tambah Barang</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Form Data Barang Baru</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-name" className="text-right">Nama Barang</Label>
                        <Input id="item-name" placeholder="cth: Pipa PVC" className="col-span-3" value={newItemData.item_name} onChange={(e) => handleAddItemFormChange('item_name', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Kategori</Label>
                        <Select value={newItemData.category_id} onValueChange={(val) => handleAddItemFormChange('category_id', val)}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder={isLoadingCategories ? "Memuat..." : "Pilih Kategori"} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.category_id} value={String(cat.category_id)}>{cat.category_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">Satuan</Label>
                        <Select value={newItemData.unit} onValueChange={(val) => handleAddItemFormChange('unit', val)}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Satuan" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rim">Rim</SelectItem>
                              <SelectItem value="Buah">Buah</SelectItem>
                              <SelectItem value="Pak">Pak</SelectItem>
                              <SelectItem value="Botol">Botol</SelectItem>
                              <SelectItem value="pcs">Pcs</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="procurement-date" className="text-right">Tgl. Pengadaan</Label>
                          <div className="grid grid-cols-3 gap-2 col-span-3">
                              <Select onValueChange={(value) => handleDateChange('add', 'day', value)} value={String(newDate.getDate())}>
                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                  <SelectContent>
                                      {Array.from({ length: getDaysInMonth(newDate.getFullYear(), newDate.getMonth()) }, (_, i) => i + 1).map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select onValueChange={(value) => handleDateChange('add', 'month', value)} value={String(newDate.getMonth())}>
                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                  <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                              </Select>
                              <Select onValueChange={(value) => handleDateChange('add', 'year', value)} value={String(newDate.getFullYear())}>
                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                  <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="initial-stock" className="text-right">Stok Awal</Label>
                        <Input id="initial-stock" type="number" className="col-span-3" value={newItemData.initial_stock} onChange={(e) => handleAddItemFormChange('initial_stock', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit-price" className="text-right">Harga Satuan</Label>
                        <Input id="unit-price" type="number" className="col-span-3" value={newItemData.unit_price} onChange={(e) => handleAddItemFormChange('unit_price', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="remarks" className="text-right">Keterangan</Label>
                        <Textarea id="remarks" placeholder="cth: Saldo awal tahun" className="col-span-3" value={newItemData.remarks} onChange={(e) => handleAddItemFormChange('remarks', e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                      <Button type="button" onClick={handleAddItem} disabled={isAdding}>{isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
          </div>
       
        <div className="rounded-md border">
          {isLoading && !isDeleting && !isUpdating ? (
            <div className="h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-foreground font-semibold">No</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Nama Barang</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Kategori</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Tgl. Pengadaan</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Stok Awal</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Stok Saat Ini</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Status</TableHead>
                <TableHead className="w-[150px] text-center text-foreground font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? items.map((item, index) => (
                <TableRow key={item.item_id}>
                  <TableCell className="text-center">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="text-center">{item.item_name}</TableCell>
                  <TableCell className="text-center">{item.category_name}</TableCell>
                  <TableCell className="text-center">{item.procurement_date ? format(new Date(item.procurement_date), "dd-MM-yyyy") : "-"}</TableCell>
                  <TableCell className="text-center">{item.initial_stock}</TableCell>
                  <TableCell className="text-center font-bold">{item.current_stock}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                       <Button size="icon" variant="ghost" className="hover:bg-yellow-500 hover:text-white" onClick={() => handleEditClick(item)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle><AlertDialogDescription>Hapus data '{item.item_name}'?</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(item.item_id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={8} className="text-center h-24">Data tidak ditemukan.</TableCell></TableRow>}
            </TableBody>
          </Table>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} href="#" className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} /></PaginationItem>
                {generatePagination(currentPage, totalPages).map((page, index) => (
                  <PaginationItem key={index}>
                    {typeof page === 'number' ? <PaginationLink href="#" isActive={currentPage === page} onClick={() => handlePageChange(page)}>{page}</PaginationLink> : <PaginationEllipsis />}
                  </PaginationItem>
                ))}
                <PaginationItem><PaginationNext onClick={() => handlePageChange(currentPage + 1)} href="#" className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}/></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit Data Barang</DialogTitle></DialogHeader>
            {selectedItem && (
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Nama Barang</Label><Input value={editedItemData.item_name || ''} onChange={(e) => handleEditFormChange('item_name', e.target.value)} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Kategori</Label>
                  <Select 
                    value={String(editedItemData.category_id || '')} 
                    onValueChange={(value) => handleEditFormChange('category_id', parseInt(value))}
                  >
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={String(cat.category_id)}>{cat.category_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Satuan</Label>
                  <Select value={editedItemData.unit} onValueChange={(value) => handleEditFormChange('unit', value)}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Satuan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rim">Rim</SelectItem><SelectItem value="Buah">Buah</SelectItem><SelectItem value="Pak">Pak</SelectItem>
                      <SelectItem value="Unit">Unit</SelectItem><SelectItem value="Botol">Botol</SelectItem><SelectItem value="pcs">Pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Tgl. Pengadaan</Label>
                  <div className="grid grid-cols-3 gap-2 col-span-3">
                      <Select onValueChange={(value) => handleDateChange('edit', 'day', value)} value={String(date?.getDate())}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{Array.from({ length: getDaysInMonth(date?.getFullYear() ?? currentYear, date?.getMonth() ?? 0) }, (_, i) => i + 1).map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select onValueChange={(value) => handleDateChange('edit', 'month', value)} value={String(date?.getMonth())}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select onValueChange={(value) => handleDateChange('edit', 'year', value)} value={String(date?.getFullYear())}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Stok Awal</Label><Input type="number" value={editedItemData.initial_stock || 0} onChange={(e) => handleEditFormChange('initial_stock', parseInt(e.target.value, 10))} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Harga Satuan</Label><Input type="number" value={editedItemData.unit_price || 0} onChange={(e) => handleEditFormChange('unit_price', e.target.value)} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Keterangan</Label><Textarea value={editedItemData.remarks || ''} onChange={(e) => handleEditFormChange('remarks', e.target.value)} className="col-span-3" /></div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
              <Button onClick={handleUpdate} disabled={isUpdating}>{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm">
        <Card className="rounded-none border-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
            <div className="p-4 text-center text-sm text-muted-foreground"><p>© 2026 BPSDM Provinsi Jawa Barat. SIMANJA. All rights reserved.</p></div>
        </Card>
      </footer>
    </div>
  );
}
