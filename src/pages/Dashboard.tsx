import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";
import { useGetDynamicQuery } from "@/redux/features/dynamic/dynamicApi";
import { IDashboard, IProduct } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppTable, Column } from "@/components/shared/AppTable";
import { Badge } from "@/components/ui/badge";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}
    >
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useGetDynamicQuery({ url: "/dashboard" });
  const stats: IDashboard = data?.data || {
    totalProducts: 0,
    totalSales: 0,
    lowStockProducts: [],
  };

  const lowStockColumns: Column<IProduct>[] = [
    {
      header: "Image",
      cell: (p) => (
        <img
          src={p.image}
          alt={p.name}
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    { header: "Product", accessor: "name" },
    { header: "SKU", accessor: "sku" },
    { header: "Category", accessor: "category" },
    {
      header: "Stock",
      cell: (p) => (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          {p.stock} left
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your inventory and sales"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats.totalProducts}
          color="bg-violet-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Sales"
          value={stats.totalSales}
          color="bg-emerald-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.lowStockProducts?.length || 0}
          color="bg-red-500"
        />
      </div>

      {/* Low Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-white font-semibold">Low Stock Products</h2>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs ml-auto">
            Stock &lt; 5
          </Badge>
        </div>
        <AppTable
          columns={lowStockColumns}
          data={stats.lowStockProducts || []}
          isLoading={isLoading}
          emptyText="No low stock products 🎉"
        />
      </div>
    </div>
  );
};

export default Dashboard;
