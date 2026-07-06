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
    url: "/products",
    params: { page, limit: 8, search: debouncedSearch },
  });

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
          url: `/products/${editProduct._id}`,
          data: fd,
        }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct({ url: "/products", data: fd }).unwrap();
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
      await deleteProduct({ url: `/products/${deleteId}` }).unwrap();
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

      {/* Add/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border border-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <div className="flex-1">
              <Label className="text-slate-300 text-sm">
                Product Image{" "}
                {!editProduct && <span className="text-red-400">*</span>}
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editProduct}
                className="mt-1.5 bg-slate-800 border-slate-700 text-slate-300 file:bg-violet-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">SKU *</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Category *</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="w-full h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:border-violet-500 outline-none"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Stock *</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Purchase Price *</Label>
              <Input
                type="number"
                min={0}
                value={form.purchasePrice}
                onChange={(e) =>
                  setForm({ ...form, purchasePrice: e.target.value })
                }
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Selling Price *</Label>
              <Input
                type="number"
                min={0}
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm({ ...form, sellingPrice: e.target.value })
                }
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-slate-700 bg-transparent text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || updating}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {creating || updating
                ? "Saving..."
                : editProduct
                  ? "Update"
                  : "Create"}
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
