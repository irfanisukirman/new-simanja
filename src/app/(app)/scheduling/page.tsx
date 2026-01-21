
'use client'

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, Pencil, PlusCircle, Trash2, FileDown, CalendarIcon, LayoutDashboard, Loader2, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { io } from "socket.io-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useRouter } from "next/navigation"

interface Schedule {
  id: number;
  tanggal: string;
  hari: string;
  nama_lokasi: string;
  nama_pegawai: string;
  status: string;
  kondisi: string;
  catatan: string;
  slide_url: string;
}

interface Pic {
  id: number;
  nama: string;
}

interface Location {
  id: number;
  nama: string;
}

const assignmentSchema = z.object({
  picId: z.string(),
  locationId: z.string(),
});

const scheduleFormSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal harus diisi.",
  }),
  assignments: z.array(assignmentSchema)
}).refine(data => {
    const filledAssignments = data.assignments.filter(a => a.picId || a.locationId);
    if (filledAssignments.length === 0) {
        return true; 
    }
    const isAnyPartiallyFilled = filledAssignments.some(a => !a.picId || !a.locationId);
    return !isAnyPartiallyFilled;
  }, {
    message: "PIC dan Lokasi harus diisi berpasangan.",
    path: ["assignments"], 
});

const getStatusBadge = (status: string) => {
  if (!status) return <Badge>Unknown</Badge>;
  let formattedStatus = status.replace(/_/g, ' ');
  if (formattedStatus.toLowerCase() === 'antri') {
    formattedStatus = 'Antrian';
  } else {
    formattedStatus = formattedStatus
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  switch (formattedStatus) {
    case "Selesai":
    case "Baik":
      return <Badge className="bg-green-500 text-white hover:bg-green-600">{formattedStatus}</Badge>;
    case "Proses":
    case "Perlu Perbaikan":
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">{formattedStatus}</Badge>;
    case "Rusak Ringan":
      return <Badge className="bg-orange-500 text-white hover:bg-orange-600">{formattedStatus}</Badge>;
    case "Rusak Berat":
      return <Badge className="bg-red-600 text-white hover:bg-red-700">{formattedStatus}</Badge>;
    case "Antrian":
      return <Badge variant="outline">{formattedStatus}</Badge>;
    default:
      return <Badge>{formattedStatus}</Badge>;
  }
};

export default function SchedulingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [pics, setPics] = useState<Pic[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [refetch, setRefetch] = useState(false);

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      assignments: Array.from({ length: 5 }, () => ({ picId: "", locationId: "" })),
    },
  });

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
      title: `Gagal ${context}`,
      description: error.response?.data?.message || "Terjadi kesalahan pada server.",
    });

    return false;
  }, [toast, router]);

  const fetchData = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      const [schedulesResponse, picsResponse, locationsResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/schedules?page=${page}&limit=10`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/locations`, { headers })
      ]);

      if (schedulesResponse.data?.data) {
        setSchedules(schedulesResponse.data.data);
        setTotalPages(schedulesResponse.data.pagination.totalPages);
      }
      if (picsResponse.data?.data) setPics(picsResponse.data.data);
      if (locationsResponse.data?.data) setLocations(locationsResponse.data.data);

    } catch (error: any) {
      handleApiError(error, "Mengambil Data");
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket.io terhubung:", socket.id);
    });

    socket.on("scheduleUpdated", () => {
      console.log("📡 Jadwal berubah – memicu fetch");
      setRefetch(prev => !prev);   // trigger refresh
    });

    socket.on("disconnect", () => {
      console.log("Socket.io terputus");
    });

    // Cleanup
    return () => {
      socket.disconnect();   // <--- tidak return value apa pun
    };
  }, []); // <--- kosong, hanya jalan sekali

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, refetch, fetchData]);

 const manualSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
        toast({ variant: "destructive", title: "Validasi Gagal", description: "Silakan periksa kembali isian Anda." });
        return;
    }

    const values = form.getValues();
    const filledAssignments = values.assignments.filter(a => a.picId && a.locationId);

    if (filledAssignments.length === 0) {
        form.setError("assignments", { type: "manual", message: "Minimal harus ada satu penugasan PIC & Lokasi yang diisi." });
        return;
    }

    setIsSubmitting(true);

    const formattedDate = values.tanggal ? format(values.tanggal, "yyyy-MM-dd") : "";
    const dayOfWeek = values.tanggal ? format(values.tanggal, "EEEE", { locale: id }) : "";

    const payload = filledAssignments.map(assignment => ({
      tanggal: formattedDate,
      hari: dayOfWeek,
      status: "antri",
      kondisi: "baik",
      catatan: "",
      pegawai_id: parseInt(assignment.picId, 10),
      lokasi_id: parseInt(assignment.locationId, 10),
      photo_url: ""
    }));

    try {
        const token = localStorage.getItem("token");
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/schedules`, payload, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });
        
        toast({ title: "Jadwal Berhasil Disimpan", className: "bg-green-500 text-white" });
        setIsModalOpen(false);
        form.reset();
        setRefetch(prev => !prev); // Trigger refetch
    } catch (error: any) {
        handleApiError(error, "Menyimpan Jadwal");
    } finally {
        setIsSubmitting(false);
    }
   
 };
 
 const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
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


  const day = form.watch("tanggal") ? format(form.watch("tanggal"), "EEEE", { locale: id }) : "";

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Jadwal Pemantauan Rutin Gedung
          </h1>
        </div>
        <div className="flex items-center justify-between pt-2 pb-4">
        <Input
                placeholder="Cari berdasarkan nama lokasi atau pegawai..."
                className="max-w-sm"
            />
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        Status Pengerjaan <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem>Tampilkan Semua</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Selesai</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Proses</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Antrian</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Status Monitoring <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Kondisi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem>Tampilkan Semua</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Baik</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Perlu Perbaikan</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Rusak Ringan</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Rusak Berat</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button> */}
            {/* <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                <Link href="/scheduling/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
                </Link>
            </Button> */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
               <Button onClick={() => { form.reset(); setIsModalOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <Form {...form}>
                <form onSubmit={(e) => { e.preventDefault(); manualSubmit(); }} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Tambah Jadwal Baru</DialogTitle>
                        {form.formState.errors.assignments && (
                            <p className="text-sm font-medium text-destructive pt-2">{form.formState.errors.assignments.message}</p>
                        )}
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                         <FormField
                            control={form.control}
                            name="tanggal"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Tanggal</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date.getDay() !== 1 && date.getDay() !== 4}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormItem className="flex flex-col">
                             <FormLabel>Hari</FormLabel>
                             <FormControl>
                                <Input value={day} readOnly disabled />
                             </FormControl>
                         </FormItem>
                    </div>
                  
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="space-y-4 border-t pt-4">
                      <Label className="text-sm font-medium">
                          PIC & Lokasi {index + 1}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`assignments.${index}.picId`}
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih PIC" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {pics.map((pic) => (
                                                <SelectItem key={pic.id} value={String(pic.id)}>{pic.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`assignments.${index}.locationId`}
                            render={({ field }) => (
                                <FormItem>
                                     <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Lokasi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={String(location.id)}>{location.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                      </div>
                    </div>
                  ))}

                  <DialogFooter className="pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" onClick={() => form.reset()}>Batal</Button>
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

        {/* Filter Section */}
        {/* <div className="flex items-center gap-2 py-4">
            
        </div> */}

        <div className="rounded-md border">
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-foreground font-semibold">No</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Tanggal</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Hari</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Lokasi</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Penanggung Jawab</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Status Pengerjaan</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Status Monitoring</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1 + (currentPage - 1) * 10}</TableCell>
                  <TableCell className="text-center">{format(new Date(item.tanggal), "dd-MM-yyyy")}</TableCell>
                  <TableCell className="text-center">{item.hari}</TableCell>
                  <TableCell className="text-center">{item.nama_lokasi}</TableCell>
                  <TableCell className="text-center">{item.nama_pegawai}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(item.kondisi)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                       <Dialog>
                        <DialogTrigger asChild>
                        <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          if (item.status.toLowerCase() === 'selesai') {
                            window.open(item.slide_url, '_blank');
                          } else {
                            toast({
                              variant: "destructive",
                              title: "Pengerjaan Belum Selesai",
                              description: "Anda hanya dapat melihat slide jika status pengerjaan sudah selesai.",
                            });
                          }
                        }}
                      >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {/* <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Eviden & Catatan untuk {item.nama_lokasi}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Image
                              src={`https://picsum.photos/seed/${item.id}/600/400`}
                              alt={`Eviden for ${item.nama_lokasi}`}
                              width={600}
                              height={400}
                              className="rounded-md"
                            />
                            <div>
                               <h3 className="font-semibold mb-2">Catatan:</h3>
                               <p>{item.catatan || "Tidak ada catatan."}</p>
                            </div>
                          </div>
                        </DialogContent> */}
                      </Dialog>
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
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus jadwal secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </div>
        {totalPages > 1 && (
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