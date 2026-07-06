// src/hooks/useErrorHandler.ts
import { useEffect } from "react";
import { toast } from "sonner";

interface ErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export const useErrorHandler = (error: any) => {
  useEffect(() => {
    if (!error) return;

    if (error?.status === 403 || error?.response?.status === 403) {
      toast.error("Access Denied", {
        description: error?.data?.message || "You don't have permission.",
        duration: 5000,
      });
      return;
    }

    let errorMessage = "An error occurred";
    if (error?.response?.data?.message) {
      const msg = error.response.data.message;
      errorMessage = Array.isArray(msg) ? msg.join(", ") : msg;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    toast.error("Error", {
      description: errorMessage,
      duration: 4000,
    });
  }, [error]);
};
