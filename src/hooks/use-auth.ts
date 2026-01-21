
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export const useAuth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setName(storedName);
      }
    } catch (error) {
      console.error("Failed to access localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('role');
      
      toast({
        variant: "success",
        title: "Logout Berhasil",
        description: "Anda telah keluar dari akun.",
      });

      // Tunggu sesaat agar toast sempat muncul sebelum reload
      setTimeout(() => {
        router.push('/login');
      }, 500);

    } catch (error) {
      console.error("Failed to clear localStorage during logout", error);
       toast({
        variant: "destructive",
        title: "Logout Gagal",
        description: "Terjadi kesalahan saat mencoba keluar.",
      });
    }
  }, [router, toast]);

  return { name, logout, isLoading };
};
