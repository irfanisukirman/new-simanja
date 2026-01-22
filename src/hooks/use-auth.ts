
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export const useAuth = () => {
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
      localStorage.clear();
      
      toast({
        variant: "success",
        title: "Logout Berhasil",
        description: "Anda telah keluar dari akun.",
      });

      // Tunggu sesaat agar toast sempat muncul sebelum reload
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);

    } catch (error) {
      console.error("Failed to clear localStorage during logout", error);
       toast({
        variant: "destructive",
        title: "Logout Gagal",
        description: "Terjadi kesalahan saat mencoba keluar.",
      });
    }
  }, [toast]);

  return { name, logout, isLoading };
};
