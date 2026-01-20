"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password cannot be empty.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        values,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = response.data;

      if (response.status === 200 && result.code === 200) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userName', result.data.user.name);

        toast({
          variant: "success",
          title: "Login Berhasil!",
          description: `Selamat datang kembali, ${result.data.user.name}.`,
        });

        router.push('/master-data-pegawai');
      } else {
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: result.message || "Email atau password salah.",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: error.response.data.message || "Email atau password salah.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Terjadi Kesalahan",
          description: "Tidak dapat terhubung ke server. Silakan coba lagi nanti.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-[url('/img_background.jpg')]">
      <Image
        src="/ic_hero.png"
        alt="Website Icon"
        width={216}
        height={216}
        className="mb-8"
      />
      <Card className="shadow-xl w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Masukan kredensial Anda untuk mengakses akun.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nama@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
