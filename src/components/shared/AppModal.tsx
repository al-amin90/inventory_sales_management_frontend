// AppModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const sizeMap = {
  sm: "w-sm",
  md: "w-md",
  lg: "w-lg",
  xl: "w-2xl",
  "2xl": "w-3xl",
  "3xl": "w-4xl",
  "4xl": "w-5xl",
};

export const AppModal = ({
  open,
  onClose,
  title,
  children,
  size = "4xl", // Default to super large
}: Props) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent
      className={`sm:max-w-none ${sizeMap[size]}   bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 text-white p-0 max-h-[90vh] overflow-hidden shadow-2xl shadow-violet-500/10`}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-700/50">
        <DialogHeader className="p-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
      </div>

      {/* Content */}
      <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-90px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);
