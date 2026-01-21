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
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card } from "@/components/ui/card"

const itemOutSchema = z.object({
  tanggal: z.date({ required_error: "Tanggal harus diisi." }),
  barang_id: z.string().min(1, "Nama barang harus dipilih."),
  pegawai_id: z.string().min(1, "Penerima harus dipilih."),
  satuan: z.string().min(1, "Satuan harus dipilih."),
  qty: z.coerce.number().min(1, "Jumlah harus lebih dari 0."),
  keterangan: z.string().optional(),
});


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
    unit: string;
    // tambahkan properti lain jika diperlukan
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>("")
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [isLoadingPegawai, setIsLoadingPegawai] = useState(false)
  const [masterBarangList, setMasterBarangList] = useState<MasterBarang[]>([]);
  const [isLoadingMasterBarang, setIsLoadingMasterBarang] = useState(false);
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barangComboboxOpen, setBarangComboboxOpen] = useState(false);
  const [pegawaiComboboxOpen, setPegawaiComboboxOpen] = useState(false);

  const form = useForm<z.infer<typeof itemOutSchema>>({
    resolver: zodResolver(itemOutSchema),
    defaultValues: {
      tanggal: new Date(),
      barang_id: "",
      pegawai_id: "",
      satuan: "",
      qty: 1,
      keterangan: "",
    },
  });

   const selectedBarangName = form.watch("barang_id");
   useEffect(() => {
    if (selectedBarangName) {
        const selectedBarangData = masterBarangList.find(b => b.item_name === selectedBarangName);
        if (selectedBarangData && selectedBarangData.unit) {
            form.setValue("satuan", selectedBarangData.unit);
        }
    }
   }, [selectedBarangName, masterBarangList, form]);


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
            const response = await axios.get("https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items?limit=9999", {
                headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            });
            setMasterBarangList(response.data.data);
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

  const onSubmit = async (values: z.infer<typeof itemOutSchema>) => {
    setIsSubmitting(true);
    
    const selectedBarang = masterBarangList.find(b => b.item_name === values.barang_id);
    const selectedPegawai = pegawaiList.find(p => p.nama === values.pegawai_id);

    if (!selectedBarang || !selectedPegawai) {
        toast({
            variant: "destructive",
            title: "Data Tidak Valid",
            description: "Barang atau pegawai yang dipilih tidak ditemukan."
        });
        setIsSubmitting(false);
        return;
    }

    const payload = {
        tanggal: format(values.tanggal, "yyyy-MM-dd"),
        barang_id: selectedBarang.item_id,
        pegawai_id: selectedPegawai.id,
        satuan: values.satuan,
        qty: values.qty,
        keterangan: values.keterangan || ""
    };

    try {
        const token = localStorage.getItem("token");
        await axios.post('https://unepigrammatically-noninstinctive-madelaine.ngrok-free.dev/api/items-out', payload, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });

        toast({
            variant: "success",
            title: "Berhasil!",
            description: "Data pengeluaran barang berhasil dicatat.",
        });

        setIsAddDialogOpen(false);
        form.reset();
        if (currentPage === 1) {
            fetchItemsOut(1);
        } else {
            setCurrentPage(1);
        }
    } catch (error: any) {
        if (!handleAuthError(error)) {
            toast({
                variant: "destructive",
                title: "Gagal Mencatat Barang Keluar",
                description: error.response?.data?.message || "Terjadi kesalahan pada server.",
            });
        }
    } finally {
        setIsSubmitting(false);
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
              onPointerDownOutside={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.rdp')) {
                  e.preventDefault();
                }
              }}
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
                    <PopoverContent className="w-auto p-0"
  align="start">
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
                                onSelect={(currentValue) => {
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Data
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-lg"
                onPointerDownOutside={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('.rdp')) {
                    e.preventDefault();
                  }
                }}
              >
                 <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Form Pengeluaran Barang</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                       <FormField
                        control={form.control}
                        name="tanggal"
                        render={({ field }) => (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tanggal</Label>
                            <div className="col-span-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? format(field.value, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                               <FormMessage className="mt-1" />
                            </div>
                          </div>
                        )}
                      />

                      <FormField
                        name="barang_id"
                        control={form.control}
                        render={({ field }) => (
                           <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Nama Barang</Label>
                            <div className="col-span-3">
                             <Popover open={barangComboboxOpen} onOpenChange={setBarangComboboxOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value || "Pilih barang..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[375px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Cari barang..." />
                                    <CommandList>
                                      <ScrollArea className="h-[200px]">
                                        <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                          {isLoadingMasterBarang ? <p className="p-2 text-center text-sm">Memuat...</p> :
                                            masterBarangList.map((barang) => (
                                              <CommandItem
                                                value={barang.item_name}
                                                key={barang.item_id}
                                                onSelect={() => {
                                                  form.setValue("barang_id", barang.item_name)
                                                  setBarangComboboxOpen(false);
                                                }}
                                              >
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    barang.item_name === field.value ? "opacity-100" : "opacity-0"
                                                  )}
                                                />
                                                {barang.item_name}
                                              </CommandItem>
                                            ))}
                                        </CommandGroup>
                                      </ScrollArea>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="mt-1" />
                            </div>
                          </div>
                        )}
                      />

                      <FormField
                        name="pegawai_id"
                        control={form.control}
                        render={({ field }) => (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Penerima</Label>
                            <div className="col-span-3">
                              <Popover open={pegawaiComboboxOpen} onOpenChange={setPegawaiComboboxOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value || "Pilih penerima..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
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
                                                value={pegawai.nama}
                                                key={pegawai.id}
                                                onSelect={() => {
                                                    form.setValue("pegawai_id", pegawai.nama);
                                                    setPegawaiComboboxOpen(false);
                                                }}
                                              >
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    pegawai.nama === field.value ? "opacity-100" : "opacity-0"
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
                              <FormMessage className="mt-1" />
                            </div>
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="satuan"
                        render={({ field }) => (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Satuan</Label>
                            <div className="col-span-3">
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih Satuan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Rim">Rim</SelectItem>
                                  <SelectItem value="Buah">Buah</SelectItem>
                                  <SelectItem value="Pak">Pak</SelectItem>
                                  <SelectItem value="Pcs">Pcs</SelectItem>
                                  <SelectItem value="Unit">Unit</SelectItem>
                                  <SelectItem value="Batang">Batang</SelectItem>
                                  <SelectItem value="Kaleng">Kaleng</SelectItem>
                                  <SelectItem value="Botol">Botol</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="mt-1" />
                            </div>
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="qty"
                        render={({ field }) => (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Jumlah</Label>
                            <div className="col-span-3">
                              <FormControl>
                                <Input type="number" placeholder="cth: 5" {...field} />
                              </FormControl>
                              <FormMessage className="mt-1" />
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isSubmitting}>Batal</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
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
