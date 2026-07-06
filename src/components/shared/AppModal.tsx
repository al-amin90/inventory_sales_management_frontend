import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export const AppModal = ({
  open,
  onClose,
  title,
  children,
  size = "md",
}: Props) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent
      className={`${sizeMap[size]} bg-slate-900 border border-slate-700 text-white`}
    >
      <DialogHeader>
        <DialogTitle className="text-white text-lg font-semibold">
          {title}
        </DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
