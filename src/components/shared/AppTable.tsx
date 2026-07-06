import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
}

export function AppTable<T>({
  columns,
  data,
  isLoading,
  emptyText = "No data found",
}: Props<T>) {
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 bg-slate-800/60 hover:bg-slate-800/60">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`text-slate-300 font-semibold ${col.className || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-slate-700">
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-slate-700 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-slate-400 py-12"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow
                key={i}
                className="border-slate-700 hover:bg-slate-800/40 transition-colors"
              >
                {columns.map((col, j) => (
                  <TableCell
                    key={j}
                    className={`text-slate-200 ${col.className || ""}`}
                  >
                    {col.cell
                      ? col.cell(row, i)
                      : col.accessor
                        ? String(row[col.accessor] ?? "—")
                        : "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
