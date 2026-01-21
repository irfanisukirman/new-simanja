
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, PlusCircle, Trash2, FileDown, CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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

const barangOptions = ["Kertas HVS F4 80", "Lem", "Gunting"];

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
  const [date, setDate] = useState<Date>()
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>("")
  const [penerimaComboboxOpen, setPenerimaComboboxOpen] = useState(false)
  const [selectedPenerima, setSelectedPenerima] = useState("")
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [isLoadingPegawai, setIsLoadingPegawai] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);


  const handleAuthError = useCallback((error: any) => {
    if (error.response?.status === 401) {
      toast({
        variant: "destructive",
        title: "Sesi Habis",
        description: "Sesi Anda telah berakhir. Silakan login kembali.",
      });
      router.push("/auth/login");
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

  useEffect(() => {
    fetchItemsOut(currentPage);
  }, [currentPage, fetchItemsOut]);
  
   useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

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
    if (!exportDateRange?.from || !exportDateRange?.to || !selectedPegawaiId) {
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
          pegawai_id: selectedPegawaiId,
        },
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });

      const items = response.data.data;
      const selectedPegawai = pegawaiList.find(p => p.id.toString() === selectedPegawaiId);

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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
            Data Pengeluaran Barang Dari Gudang
        </h1>
      </div>
      <div className="flex justify-end gap-2">
         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
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
                    <Calendar
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
                 <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedPegawaiId
                        ? pegawaiList.find((pegawai) => pegawai.id.toString() === selectedPegawaiId)?.nama
                        : "Pilih penerima..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Cari penerima..." />
                      <CommandList>
                        <ScrollArea className="h-[200px]">
                        <CommandEmpty>Penerima tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {isLoadingPegawai ? <p className="p-2 text-center text-sm">Memuat...</p> : 
                          pegawaiList.map((pegawai) => (
                            <CommandItem
                              key={pegawai.id}
                              value={pegawai.id.toString()}
                              onSelect={(currentValue: string) => {
                                setSelectedPegawaiId(currentValue === selectedPegawaiId ? "" : currentValue)
                                setComboboxOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPegawaiId === pegawai.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {pegawai.nama}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        </ScrollArea>
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
        <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Form Pengeluaran Barang</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tanggal-keluar" className="text-right">Tanggal</Label>
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
                  <Label htmlFor="nama-barang" className="text-right">Nama Barang</Label>
                  <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih Barang" />
                      </SelectTrigger>
                      <SelectContent>
                        {barangOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="penerima" className="text-right">Penerima</Label>
                  <Popover open={penerimaComboboxOpen} onOpenChange={setPenerimaComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={penerimaComboboxOpen}
                      className="w-full justify-between col-span-3"
                    >
                      {selectedPenerima ? selectedPenerima : "Pilih penerima..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[375px] p-0">
                    <Command>
                      <CommandInput placeholder="Cari penerima..." />
                      <CommandList>
                        <ScrollArea className="h-[200px]">
                        <CommandEmpty>Penerima tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                           {isLoadingPegawai ? <p className="p-2 text-center text-sm">Memuat...</p> : 
                          pegawaiList.map((pegawai) => (
                            <CommandItem
                              key={pegawai.id}
                              value={pegawai.nama}
                              onSelect={(currentValue: string) => {
                                setSelectedPenerima(currentValue === selectedPenerima ? "" : currentValue)
                                setPenerimaComboboxOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPenerima === pegawai.nama ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {pegawai.nama}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="satuan" className="text-right">Satuan</Label>
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
                  <Label htmlFor="jumlah" className="text-right">Jumlah</Label>
                  <Input id="jumlah" type="number" placeholder="cth: 5" className="col-span-3" />
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
              <TableHead className="text-center text-foreground font-semibold">Harga Satuan</TableHead>
              <TableHead className="text-center text-foreground font-semibold">Total Harga</TableHead>
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
                  <TableCell className="text-center">{formatCurrency(parseFloat(item.harga_satuan))}</TableCell>
                  <TableCell className="text-center">{formatCurrency(parseFloat(item.total_harga))}</TableCell>
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
  );
}

    
