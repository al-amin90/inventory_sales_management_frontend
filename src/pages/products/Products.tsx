import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import {
  useGetDynamicQuery,
  useDeleteDynamicMutation,
  usePatchDynamicMutation,
  usePostDynamicMutation,
} from "@/redux/features/dynamic/dynamicApi";
import { IProduct, IMeta } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppTable, Column } from "@/components/shared/AppTable";
import { AppPagination } from "@/components/shared/AppPagination";
import { AppModal } from "@/components/shared/AppModal";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORIES = ["Electronics", "Clothing", "Food", "Furniture", "Other"];

const defaultForm = {
  name: "",
  sku: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  stock: "",
};

const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<IProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useGetDynamicQuery({
    url: "/product",
    params: { page, limit: 8, searchTerm: debouncedSearch },
  });
  console.log("data", data);

  const products: IProduct[] = data?.data || [];
  const meta: IMeta = data?.meta;

  const [createProduct, { isLoading: creating }] = usePostDynamicMutation();
  const [updateProduct, { isLoading: updating }] = usePatchDynamicMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteDynamicMutation();

  const openAdd = () => {
    setEditProduct(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const openEdit = (p: IProduct) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      purchasePrice: String(p.purchasePrice),
      sellingPrice: String(p.sellingPrice),
      stock: String(p.stock),
    });
    setImagePreview(p.image);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editProduct) {
        await updateProduct({
          url: `/product/${editProduct._id}`,
          data: fd,
        }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct({ url: "/product", data: fd }).unwrap();
        toast.success("Product created");
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct({ url: `/product/${deleteId}` }).unwrap();
      toast.success("Product deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns: Column<IProduct>[] = [
    {
      header: "#",
      cell: (_, i) => (
        <span className="text-slate-500 text-xs">{(page - 1) * 8 + i + 1}</span>
      ),
    },
    {
      header: "Product",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.image}
            alt={p.name}
            className="w-10 h-10 rounded-lg object-cover border border-slate-700"
          />
          <div>
            <p className="text-white font-medium text-sm">{p.name}</p>
            <p className="text-slate-500 text-xs">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { header: "Category", accessor: "category" },
    {
      header: "Purchase",
      cell: (p) => <span className="text-slate-300">৳{p.purchasePrice}</span>,
    },
    {
      header: "Selling",
      cell: (p) => (
        <span className="text-emerald-400 font-medium">৳{p.sellingPrice}</span>
      ),
    },
    {
      header: "Stock",
      cell: (p) => (
        <Badge
          className={
            p.stock < 5
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }
        >
          {p.stock}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (p) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEdit(p)}
            className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-700 h-8 w-8 p-0"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteId(p._id)}
            className="border-red-900/50 bg-transparent text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product inventory"
        action={
          <Button
            onClick={openAdd}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        }
      />
      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
        />
      </div>
      <AppTable columns={columns} data={products} isLoading={isLoading} />
      <AppPagination meta={meta} page={page} onPageChange={setPage} />

      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? "Edit Product" : " Add New Product"}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image upload - Enhanced design */}
          <div className="flex items-center gap-6 p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300">
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-600/50 overflow-hidden bg-slate-800/50 flex items-center justify-center flex-shrink-0 hover:border-violet-500 transition-all duration-300 hover:scale-105 group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-500 group-hover:text-violet-400 transition-colors">
                  <Package className="w-12 h-12 mb-1" />
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label className="text-slate-200 text-lg font-semibold">
                Product Image{" "}
                {!editProduct && <span className="text-violet-400">*</span>}
              </Label>
              <p className="text-slate-400 text-sm mt-1 mb-3">
                Upload a product image (JPG, PNG, WebP) - Max 5MB
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editProduct}
                className="w-full bg-slate-800/50 border-slate-600/50 text-slate-200 text-sm rounded-xl file:bg-gradient-to-r file:from-violet-600 file:to-purple-600 file:text-white file:border-0 file:rounded-lg file:px-6  file:text-sm file:font-semibold hover:file:shadow-lg hover:file:shadow-violet-500/25 transition-all duration-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Form Fields - Consistent sizing */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Product Name <span className="text-violet-400">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Enter product name"
                className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border-slate-600/50 text-white text-base placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
                SKU <span className="text-violet-400">*</span>
              </Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                placeholder="e.g. PRD-001"
                className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border-slate-600/50 text-white text-base placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Category <span className="text-violet-400">*</span>
              </Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white text-base focus:border-violet-500 outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1.5rem",
                }}
              >
                <option value="" className="bg-slate-800">
                  Select category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-800">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Stock Quantity <span className="text-violet-400">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
                placeholder="0"
                className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border-slate-600/50 text-white text-base placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Purchase Price <span className="text-violet-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">
                  ৳
                </span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={(e) =>
                    setForm({ ...form, purchasePrice: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-800/50 border-slate-600/50 text-white text-base placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Selling Price <span className="text-violet-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">
                  ৳
                </span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellingPrice: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-800/50 border-slate-600/50 text-white text-base placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-slate-600/50 bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white text-base font-medium px-8 py-2.5 h-12 rounded-xl transition-all duration-200 hover:border-slate-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || updating}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-base font-semibold px-10 py-2.5 h-12 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 hover:scale-105"
            >
              {creating || updating ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></span>
                  {editProduct ? "Updating..." : "Creating..."}
                </>
              ) : editProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </AppModal>
      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The product will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-transparent text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
