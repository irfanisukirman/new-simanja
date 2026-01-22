
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
  DialogFooter,
  DialogClose,
  DialogTrigger
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, PlusCircle, Trash2, FileDown, CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { CustomCalendar } from "@/components/ui/calendar-custom"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Card } from "@/components/ui/card"

interface Pegawai {
  id: number;
  nama: string;
  nip: string | null;
  golongan: string | null;
}

interface ItemOut {
  id: number;
  tanggal: string;
  nama_barang: string;
  penerima: string;
  satuan: string;
  qty: number;
  harga_satuan: string;
  total_harga: string;
}

interface MasterBarang {
  item_id: number;
  item_name: string;
  current_stock: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
}

export default function BarangKeluarPage() {
  const { toast } = useToast();
  const router = useRouter();

  // State for main data table
  const [items, setItems] = useState<ItemOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // State for forms and dialogs
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [isLoadingPegawai, setIsLoadingPegawai] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportPegawaiComboboxOpen, setExportPegawaiComboboxOpen] = useState(false);
  const [exportSelectedPegawaiId, setExportSelectedPegawaiId] = useState("");

  // State for Add Item Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [masterBarang, setMasterBarang] = useState<MasterBarang[]>([]);
  const [isLoadingMasterBarang, setIsLoadingMasterBarang] = useState(false);
  const [addTanggal, setAddTanggal] = useState<Date | undefined>(new Date());
  const [addSelectedBarangId, setAddSelectedBarangId] = useState("");
  const [addSelectedPegawaiId, setAddSelectedPegawaiId] = useState("");
  const [addQty, setAddQty] = useState<number | string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [addBarangComboboxOpen, setAddBarangComboboxOpen] = useState(false);
  const [addPegawaiComboboxOpen, setAddPegawaiComboboxOpen] = useState(false);


  const handleAuthError = useCallback((error: any) => {
    if (error.response?.status === 401) {
      toast({
        variant: "destructive",
        title: "Sesi Habis",
        description: "Sesi Anda telah berakhir. Silakan login kembali.",
      });
      router.push("/login");
      return true;
    }
    return false;
  }, [toast, router]);

  const fetchItemsOut = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items-out?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      setItems(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Mengambil Data Barang Keluar",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, handleAuthError]);

  const fetchPegawai = useCallback(async () => {
    setIsLoadingPegawai(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/users", {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      setPegawaiList(response.data.data);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Mengambil Data Pegawai",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsLoadingPegawai(false);
    }
  }, [toast, handleAuthError]);

  const fetchMasterBarang = useCallback(async () => {
    setIsLoadingMasterBarang(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items?limit=9999`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      setMasterBarang(response.data.data);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Mengambil Data Master Barang",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsLoadingMasterBarang(false);
    }
  }, [toast, handleAuthError]);

  useEffect(() => {
    fetchItemsOut(currentPage);
  }, [currentPage, fetchItemsOut]);
  
   useEffect(() => {
    fetchPegawai();
    fetchMasterBarang();
  }, [fetchPegawai, fetchMasterBarang]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (itemId: number) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items-out/${itemId}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      toast({
        variant: "success",
        title: "Berhasil!",
        description: "Data pengeluaran barang telah dihapus.",
      });
      // Refetch data for the current page
      fetchItemsOut(currentPage);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Menghapus Data",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!exportDateRange?.from || !exportDateRange?.to || !exportSelectedPegawaiId) {
      toast({
        variant: "destructive",
        title: "Input Tidak Lengkap",
        description: "Harap pastikan rentang tanggal dan pegawai sudah dipilih.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const startDate = format(exportDateRange.from, 'yyyy-MM-dd');
      const endDate = format(exportDateRange.to, 'yyyy-MM-dd');

      const response = await axios.get(`https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items-out/by-employee`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          pegawai_id: exportSelectedPegawaiId,
        },
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });

      const items = response.data.data;
      const selectedPegawai = pegawaiList.find(p => p.id.toString() === exportSelectedPegawaiId);

      const exportData = {
          items: items,
          pegawai: {
              nama: selectedPegawai?.nama || 'Tidak Ditemukan',
              nip: selectedPegawai?.nip || '-',
              pangkat_golongan: selectedPegawai?.golongan || '-',
          },
          range: {
              start_date: startDate,
              end_date: endDate
          }
      };

      sessionStorage.setItem('exportData', JSON.stringify(exportData));
      
      const printWindow = window.open('/print/bend29', '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
         toast({
          variant: "destructive",
          title: "Gagal Membuka Halaman Cetak",
          description: "Browser Anda mungkin memblokir pop-up. Mohon izinkan pop-up untuk situs ini.",
        });
      }

    } catch (error: any) {
      if (!handleAuthError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Mengekspor Data",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

    const handleAddItem = async () => {
    if (!addTanggal || !addSelectedBarangId || !addSelectedPegawaiId || !addQty) {
      toast({
        variant: "destructive",
        title: "Input Tidak Lengkap",
        description: "Harap isi semua kolom yang diperlukan.",
      });
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        tanggal: format(addTanggal, 'yyyy-MM-dd'),
        item_id: parseInt(addSelectedBarangId),
        pegawai_id: parseInt(addSelectedPegawaiId),
        qty: typeof addQty === 'string' ? parseInt(addQty) : addQty,
      };

      await axios.post(`https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items-out`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });

      toast({
        variant: "success",
        title: "Berhasil!",
        description: "Data pengeluaran barang berhasil ditambahkan.",
      });
      
      setIsAddDialogOpen(false);
      setAddTanggal(new Date());
      setAddSelectedBarangId("");
      setAddSelectedPegawaiId("");
      setAddQty("");
      
      fetchItemsOut(currentPage);

    } catch (error: any) {
      if (!handleAuthError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Menambah Data",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsAdding(false);
    }
  };


  const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 10) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    for (let i = -2; i <= 2; i++) {
        const page = currentPage + i;
        if (page > 1 && page < totalPages) {
            pages.add(page);
        }
    }
    
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
           Barang Keluar
          </h1>
        </div>
        <div className="flex justify-end gap-2 pt-2 pb-4">
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-md"
            >
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 items-center gap-2">
                  <Label htmlFor="tanggal-export">Rentang Tanggal</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !exportDateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportDateRange?.from ? (
                          exportDateRange.to ? (
                            <>
                              {format(exportDateRange.from, "LLL dd, y", { locale: id })} -{" "}
                              {format(exportDateRange.to, "LLL dd, y", { locale: id })}
                            </>
                          ) : (
                            format(exportDateRange.from, "LLL dd, y", { locale: id })
                          )
                        ) : (
                          <span>Pilih rentang tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CustomCalendar
                        initialFocus
                        mode="range"
                        defaultMonth={exportDateRange?.from}
                        selected={exportDateRange}
                        onSelect={setExportDateRange}
                        numberOfMonths={2}
                        locale={id}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                 <div className="grid grid-cols-1 items-center gap-2">
                  <Label htmlFor="pegawai-export">Penerima</Label>
                   <Popover open={exportPegawaiComboboxOpen} onOpenChange={setExportPegawaiComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={exportPegawaiComboboxOpen}
                        className="w-full justify-between"
                      >
                        {exportSelectedPegawaiId
                          ? pegawaiList.find((pegawai) => pegawai.id.toString() === exportSelectedPegawaiId)?.nama
                          : "Pilih penerima..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Cari penerima..." />
                        <CommandList>
                          <CommandEmpty>Penerima tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {isLoadingPegawai ? <p className="p-2 text-center text-sm">Memuat...</p> : 
                            pegawaiList.map((pegawai) => (
                              <CommandItem
                                key={pegawai.id}
                                value={pegawai.id.toString()}
                                onSelect={(currentValue: string) => {
                                  setExportSelectedPegawaiId(currentValue === exportSelectedPegawaiId ? "" : currentValue)
                                  setExportPegawaiComboboxOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    exportSelectedPegawaiId === pegawai.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {pegawai.nama}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
          
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tambah Barang Keluar</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tanggal" className="text-right">Tanggal</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal col-span-3",
                              !addTanggal && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {addTanggal ? format(addTanggal, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CustomCalendar
                            mode="single"
                            selected={addTanggal}
                            onSelect={setAddTanggal}
                            initialFocus
                            locale={id}
                          />
                        </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama_barang" className="text-right">Nama Barang</Label>
                     <Popover open={addBarangComboboxOpen} onOpenChange={setAddBarangComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={addBarangComboboxOpen}
                            className="w-full justify-between col-span-3"
                          >
                            {addSelectedBarangId
                              ? masterBarang.find((barang) => barang.item_id.toString() === addSelectedBarangId)?.item_name
                              : "Pilih barang..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 col-span-3">
                          <Command>
                            <CommandInput placeholder="Cari barang..." />
                            <CommandList>
                              <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                              <CommandGroup>
                                {isLoadingMasterBarang ? <p className="p-2 text-center text-sm">Memuat...</p> : 
                                masterBarang.map((barang) => (
                                  <CommandItem
                                    key={barang.item_id}
                                    value={barang.item_id.toString()}
                                    onSelect={(currentValue) => {
                                      setAddSelectedBarangId(currentValue === addSelectedBarangId ? "" : currentValue)
                                      setAddBarangComboboxOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        addSelectedBarangId === barang.item_id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {barang.item_name} (Stok: {barang.current_stock})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="penerima" className="text-right">Penerima</Label>
                    <Popover open={addPegawaiComboboxOpen} onOpenChange={setAddPegawaiComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={addPegawaiComboboxOpen}
                            className="w-full justify-between col-span-3"
                          >
                            {addSelectedPegawaiId
                              ? pegawaiList.find((pegawai) => pegawai.id.toString() === addSelectedPegawaiId)?.nama
                              : "Pilih penerima..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 col-span-3">
                          <Command>
                            <CommandInput placeholder="Cari penerima..." />
                            <CommandList>
                              <CommandEmpty>Penerima tidak ditemukan.</CommandEmpty>
                              <CommandGroup>
                                {isLoadingPegawai ? <p className="p-2 text-center text-sm">Memuat...</p> : 
                                pegawaiList.map((pegawai) => (
                                  <CommandItem
                                    key={pegawai.id}
                                    value={pegawai.id.toString()}
                                    onSelect={(currentValue) => {
                                      setAddSelectedPegawaiId(currentValue === addSelectedPegawaiId ? "" : currentValue)
                                      setAddPegawaiComboboxOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        addSelectedPegawaiId === pegawai.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {pegawai.nama}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="qty" className="text-right">Jumlah</Label>
                    <Input id="qty" type="number" placeholder="0" className="col-span-3" value={addQty} onChange={(e) => setAddQty(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isAdding}>Batal</Button>
                  </DialogClose>
                  <Button onClick={handleAddItem} disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="h-96 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-foreground font-semibold">No</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Tanggal</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Nama Barang</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Penerima</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Satuan</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Jumlah</TableHead>
                <TableHead className="text-right text-foreground font-semibold">Harga Satuan</TableHead>
                <TableHead className="text-right text-foreground font-semibold">Total Harga</TableHead>
                <TableHead className="w-[150px] text-center text-foreground font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{index + 1 + (currentPage - 1) * 10}</TableCell>
                    <TableCell className="text-center">{format(new Date(item.tanggal), "dd-MM-yyyy")}</TableCell>
                    <TableCell className="text-center">{item.nama_barang}</TableCell>
                    <TableCell className="text-center">{item.penerima}</TableCell>
                    <TableCell className="text-center">{item.satuan}</TableCell>
                    <TableCell className="text-center">{item.qty}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(item.harga_satuan))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(item.total_harga))}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="icon" variant="ghost" className="hover:bg-yellow-500 hover:text-white">
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
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pengeluaran barang untuk '{item.nama_barang}' secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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

    
