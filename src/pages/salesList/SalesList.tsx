import { useState } from "react";
import { ShoppingCart, TrendingUp, Package } from "lucide-react";
import { useGetDynamicQuery } from "@/redux/features/dynamic/dynamicApi";
import { ISale, IMeta } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppTable, Column } from "@/components/shared/AppTable";
import { AppPagination } from "@/components/shared/AppPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SalesList = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useGetDynamicQuery({
    url: "/sale",
    params: { page, limit: 10 },
  });

  const sales: ISale[] = data?.data || [];
  const meta: IMeta = data?.meta;

  // Total revenue
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);

  const columns: Column<ISale>[] = [
    {
      header: "#",
      cell: (_, i) => (
        <span className="text-slate-500 text-xs font-mono">
          {String((page - 1) * 10 + i + 1).padStart(3, "0")}
        </span>
      ),
    },
    {
      header: "Products",
      cell: (s) => (
        <div className="flex flex-col gap-1">
          {s.items.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <img
                src={item.product?.image}
                alt={item.product?.name}
                className="w-6 h-6 rounded object-cover border border-slate-700 flex-shrink-0"
              />
              <span className="text-slate-300 text-xs truncate max-w-[140px]">
                {item.product?.name}
              </span>
              <Badge className="bg-slate-700 text-slate-300 text-xs px-1.5">
                ×{item.quantity}
              </Badge>
            </div>
          ))}
          {s.items.length > 2 && (
            <span className="text-slate-500 text-xs">
              +{s.items.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Items",
      cell: (s) => (
        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
          {s.items.length} item{s.items.length > 1 ? "s" : ""}
        </Badge>
      ),
    },
    {
      header: "Total Qty",
      cell: (s) => (
        <span className="text-slate-300">
          {s.items.reduce((sum, item) => sum + item.quantity, 0)}
        </span>
      ),
    },
    {
      header: "Grand Total",
      cell: (s) => (
        <span className="text-emerald-400 font-semibold">
          ৳{s.grandTotal.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Sold By",
      cell: (s) => (
        <div>
          <p className="text-slate-300 text-sm">{s.soldBy?.name}</p>
          <p className="text-slate-500 text-xs capitalize">{s.soldBy?.role}</p>
        </div>
      ),
    },
    {
      header: "Date",
      cell: (s) => (
        <div>
          <p className="text-slate-300 text-xs">
            {new Date(s.createdAt).toLocaleDateString("en-GB")}
          </p>
          <p className="text-slate-500 text-xs">
            {new Date(s.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales History"
        subtitle="All recorded sales transactions"
        action={
          <Button
            onClick={() => navigate("/dashboard/sales/create")}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> New Sale
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Total Sales</p>
            <p className="text-white font-bold text-lg">{meta?.total || 0}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Page Revenue</p>
            <p className="text-white font-bold text-lg">
              ৳{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Avg. Items/Sale</p>
            <p className="text-white font-bold text-lg">
              {sales.length
                ? (
                    sales.reduce((s, sale) => s + sale.items.length, 0) /
                    sales.length
                  ).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>

      <AppTable
        columns={columns}
        data={sales}
        isLoading={isLoading}
        emptyText="No sales yet"
      />
      <AppPagination meta={meta} page={page} onPageChange={setPage} />
    </div>
  );
};

export default SalesList;
