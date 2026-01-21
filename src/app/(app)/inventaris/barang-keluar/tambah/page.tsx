
"use client"

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
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
import { useForm } from "react-hook-form"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
}

interface MasterBarang {
    item_id: number;
    item_name: string;
    unit: string;
}

export default function TambahBarangKeluarPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [isLoadingPegawai, setIsLoadingPegawai] = useState(false);
  const [masterBarangList, setMasterBarangList] = useState<MasterBarang[]>([]);
  const [isLoadingMasterBarang, setIsLoadingMasterBarang] = useState(false);
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
    fetchPegawai();
    fetchMasterBarang();
  }, [fetchPegawai, fetchMasterBarang]);

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

        router.push("/inventaris/barang-keluar");
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


  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Tambah Data Barang Keluar</CardTitle>
          <CardDescription>Isi formulir di bawah ini untuk mencatat pengeluaran barang dari gudang.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-2">
               <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="barang_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Barang</FormLabel>
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
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                      <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="pegawai_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penerima</FormLabel>
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
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                      <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="satuan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satuan</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="cth: 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                    <Link href="/inventaris/barang-keluar">Batal</Link>
                </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
