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
  DialogClose
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
import { Pencil, PlusCircle, Trash2, FileDown, CalendarIcon, Loader2, Search } from "lucide-react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { Card } from "@/components/ui/card"

interface Item {
    item_id: number;
    item_code: string;
    item_name: string;
    category: string;
    unit: string;
    procurement_date: string;
    initial_stock: number;
    current_stock: number;
    unit_price: string;
    status: string;
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
  category: { label: "Kategori", selected: true },
  unit: { label: "Satuan", selected: true },
  procurement_date: { label: "Tgl. Pengadaan", selected: true },
  initial_stock: { label: "Stok Awal", selected: true },
  current_stock: { label: "Stok Saat Ini", selected: true },
  unit_price: { label: "Harga Satuan", selected: true },
  status: { label: "Status", selected: true },
}


export default function MasterDataBarangPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date>()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFileName, setExportFileName] = useState("data_barang");
  const [selectedExportColumns, setSelectedExportColumns] = useState(exportColumnsDefault);
  const [editedItemData, setEditedItemData] = useState<Partial<Item>>({});

  const handleApiError = useCallback((error: any, context: string = "general") => {
    if (error.response?.status === 401) {
        toast({
            variant: "destructive",
            title: "Sesi Habis",
            description: "Sesi Anda telah berakhir. Silakan login kembali.",
        });
        localStorage.clear();
        router.push("/login");
        return true;
    }
    
    toast({
      variant: "destructive",
      title: `Terjadi Kesalahan - ${context}`,
      description: error.response?.data?.message || "Tidak dapat terhubung ke server.",
    });

    return false;
  }, [toast, router]);
  
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
    const handler = setTimeout(() => {
        fetchData(currentPage, searchKeyword);
    }, 500); // 500ms debounce

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
    setEditedItemData({ ...item });
    if (item.procurement_date) {
        setDate(new Date(item.procurement_date));
    } else {
        setDate(undefined);
    }
    setIsEditDialogOpen(true);
  };

  const handleEditFormChange = (field: keyof Item, value: any) => {
    setEditedItemData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = event.target.value;
    setSearchKeyword(keyword);
    setCurrentPage(1); // Always reset to page 1 on new search
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

      if (searchKeyword) {
          setSearchKeyword('');
          if (currentPage !== 1) {
              setCurrentPage(1);
          } else {
              fetchData(1, '');
          }
      } else {
          // Optimistic UI update for smoother experience
          setItems(prevItems => prevItems.filter(item => item.item_id !== itemId));
          // Smart refetch after deletion
          const isLastItemOnPage = items.length === 1 && currentPage > 1;
          if (isLastItemOnPage) {
            setCurrentPage(prev => prev - 1);
          } else {
            fetchData(currentPage, '');
          }
      }

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
            category: editedItemData.category,
            unit: editedItemData.unit,
            procurement_date: date ? format(date, "yyyy-MM-dd") : undefined,
            initial_stock: editedItemData.initial_stock,
            unit_price: editedItemData.unit_price,
        };

        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/${selectedItem.item_id}`, payload, {
             headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        });

        toast({
            variant: "success",
            title: "Berhasil!",
            description: "Barang telah berhasil diperbarui.",
        });
        
        setIsEditDialogOpen(false);
        fetchData(currentPage, searchKeyword); // Refresh list without resetting page/search

    } catch (error: any) {
        handleApiError(error, "Update Item");
    } finally {
        setIsUpdating(false);
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
      // Fetch all data for export, assuming API supports a no-pagination param or high limit
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
              row[value.label] = parseFloat(item.unit_price)
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

      // auto-size columns
      const cols = Object.keys(dataToExport[0] || {});
      const colWidths = cols.map(col => ({
        wch: Math.max(
          col.length,
          ...dataToExport.map((row: any) => String(row[col]).length)
        ) + 2 // add extra padding
      }));
      worksheet["!cols"] = colWidths;
      
      // Format price column as number
      const priceColIndex = activeColumns.findIndex(([key]) => key === 'unit_price');
      if (priceColIndex !== -1) {
          const priceCol = XLSX.utils.encode_col(priceColIndex);
          for (let i = 2; i <= dataToExport.length + 1; i++) { // Start from row 2 (after header)
              const cellRef = `${priceCol}${i}`;
              if (worksheet[cellRef]) {
                  worksheet[cellRef].t = 'n';
                  worksheet[cellRef].z = '#,##0';
              }
          }
      }


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

  const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 10) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    // Add pages around the current page
    for (let i = -2; i <= 2; i++) {
        const page = currentPage + i;
        if (page > 1 && page < totalPages) {
            pages.add(page);
        }
    }
    
    // Add ellipsis placeholders
    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const paginatedItems: (number | string)[] = [];
    
    let lastPage = 0;
    for (const page of sortedPages) {
        if (lastPage !== 0 && page - lastPage > 1) {
            paginatedItems.push('...');
        }
        paginatedItems.push(page);
        lastPage = page;
    }

    return paginatedItems;
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
          Master Data Barang
          </h1>
        </div>
         <div className="flex justify-between items-center pt-2 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama atau kode barang..."
                  className="w-full md:w-[500px] pl-10"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                />
            </div>
            <div className="flex gap-2">
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Export Data Barang ke Excel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 items-center gap-2">
                        <Label htmlFor="export-filename">Nama File</Label>
                        <Input 
                          id="export-filename" 
                          value={exportFileName}
                          onChange={(e) => setExportFileName(e.target.value)}
                          placeholder="Contoh: data_barang_2024"
                        />
                      </div>
                       <div className="grid grid-cols-1 items-center gap-2">
                          <Label>Pilih Kolom untuk Diekspor</Label>
                          <div className="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-48 overflow-y-auto">
                            {Object.entries(selectedExportColumns).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`col-${key}`}
                                  checked={value.selected}
                                  onCheckedChange={() => handleExportColumnChange(key as keyof typeof exportColumnsDefault)}
                                />
                                <Label htmlFor={`col-${key}`} className="font-normal cursor-pointer text-sm">{value.label}</Label>
                              </div>
                            ))}
                          </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button type="button" variant="secondary" disabled={isExporting}>Batal</Button>
                      </DialogClose>
                      <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Export
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Barang
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Form Data Barang Baru</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-code" className="text-right">Kode Barang</Label>
                        <Input id="item-code" placeholder="cth: ATK-003" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-name" className="text-right">Nama Barang</Label>
                        <Input id="item-name" placeholder="cth: Pulpen Boxy" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Kategori</Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alat Tulis Kantor">Alat Tulis Kantor</SelectItem>
                              <SelectItem value="Bahan Bangunan">Bahan Bangunan</SelectItem>
                              <SelectItem value="Elektronik">Elektronik</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">Satuan</Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Pilih Satuan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rim">Rim</SelectItem>
                              <SelectItem value="Buah">Buah</SelectItem>
                              <SelectItem value="Pak">Pak</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="procurement-date" className="text-right">Tgl. Pengadaan</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal col-span-3",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="initial-stock" className="text-right">Stok Awal</Label>
                        <Input id="initial-stock" type="number" placeholder="cth: 100" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit-price" className="text-right">Harga Satuan</Label>
                        <Input id="unit-price" type="number" placeholder="cth: 50000" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Batal</Button>
                      </DialogClose>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
          </div>
       
        <div className="rounded-md border">
          {isLoading && !isDeleting && !isUpdating ? (
            <div className="h-96 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-foreground font-semibold">No</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Kode Barang</TableHead>
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
                  <TableCell className="text-center">{item.item_code}</TableCell>
                  <TableCell className="text-center">{item.item_name}</TableCell>
                  <TableCell className="text-center">{item.category}</TableCell>
                  <TableCell className="text-center">{item.procurement_date ? format(new Date(item.procurement_date), "dd-MM-yyyy") : "-"}</TableCell>
                  <TableCell className="text-center">{item.initial_stock}</TableCell>
                  <TableCell className="text-center font-bold">{item.current_stock}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                       <Button size="icon" variant="ghost" className="hover:bg-yellow-500 hover:text-white" onClick={() => handleEditClick(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="icon" variant="ghost" className="hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus data barang '{item.item_name}' dari daftar. Data tidak terhapus permanen dari sistem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive hover:bg-destructive/90" 
                              onClick={() => handleDelete(item.item_id)}
                              disabled={isDeleting}
                            >
                              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24">
                    {searchKeyword ? 'Tidak ada barang yang cocok dengan pencarian Anda.' : 'Tidak ada data barang.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} href="#" className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
                {generatePagination(currentPage, totalPages).map((page, index) => (
                  <PaginationItem key={index}>
                    {typeof page === 'number' ? (
                      <PaginationLink href="#" isActive={currentPage === page} onClick={() => handlePageChange(page)}>
                        {page}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} href="#" className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}/>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

         {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Data Barang</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-item-code" className="text-right">Kode Barang</Label>
                  <Input id="edit-item-code" value={editedItemData.item_code || ''} className="col-span-3" disabled />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-item-name" className="text-right">Nama Barang</Label>
                  <Input id="edit-item-name" value={editedItemData.item_name || ''} onChange={(e) => handleEditFormChange('item_name', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Kategori</Label>
                  <Select value={editedItemData.category} onValueChange={(value) => handleEditFormChange('category', value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alat Tulis Kantor">Alat Tulis Kantor</SelectItem>
                      <SelectItem value="Bahan Bangunan">Bahan Bangunan</SelectItem>
                      <SelectItem value="Elektronik">Elektronik</SelectItem>
                       <SelectItem value="Belanja Bahan Pokok">Belanja Bahan Pokok</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-unit" className="text-right">Satuan</Label>
                  <Select value={editedItemData.unit} onValueChange={(value) => handleEditFormChange('unit', value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rim">Rim</SelectItem>
                      <SelectItem value="Buah">Buah</SelectItem>
                      <SelectItem value="Pak">Pak</SelectItem>
                      <SelectItem value="Unit">Unit</SelectItem>
                      <SelectItem value="Batang">Batang</SelectItem>
                      <SelectItem value="Kaleng">Kaleng</SelectItem>
                      <SelectItem value="Botol">Botol</SelectItem>
                      <SelectItem value="pcs">Pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-procurement-date" className="text-right">Tgl. Pengadaan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal col-span-3",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-initial-stock" className="text-right">Stok Awal</Label>
                  <Input id="edit-initial-stock" type="number" value={editedItemData.initial_stock || 0} onChange={(e) => handleEditFormChange('initial_stock', parseInt(e.target.value, 10))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-unit-price" className="text-right">Harga Satuan</Label>
                  <Input id="edit-unit-price" type="number" value={editedItemData.unit_price || 0} onChange={(e) => handleEditFormChange('unit_price', e.target.value)} className="col-span-3" />
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isUpdating}>Batal</Button>
              </DialogClose>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
