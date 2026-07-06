import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IMeta } from "@/types";

interface Props {
  meta?: IMeta;
  page: number;
  onPageChange: (p: number) => void;
}

export const AppPagination = ({ meta, page, onPageChange }: Props) => {
  if (!meta || meta.totalPage <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-slate-400 text-sm">
      <span>
        Showing {(page - 1) * meta.limit + 1}–
        {Math.min(page * meta.limit, meta.total)} of {meta.total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: meta.totalPage }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "outline"}
            onClick={() => onPageChange(p)}
            className={
              p === page
                ? "bg-violet-600 hover:bg-violet-700 border-0"
                : "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
            }
          >
            {p}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page === meta.totalPage}
          className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
