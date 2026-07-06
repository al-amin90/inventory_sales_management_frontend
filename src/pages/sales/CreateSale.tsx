import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Search } from "lucide-react";
import {
  useGetDynamicQuery,
  usePostDynamicMutation,
} from "@/redux/features/dynamic/dynamicApi";
import { IProduct } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import { useErrorHandler } from "@/utils/useErrorHandler";

interface CartItem {
  product: IProduct;
  quantity: number;
}

const CreateSale = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const debouncedSearch = useDebounce(search);

  const { refetch, data, isLoading, error } = useGetDynamicQuery({
    url: "/product",
    params: { limit: 20, searchTerm: debouncedSearch },
  });

  useErrorHandler(error);

  const products: IProduct[] = (data?.data || []).filter(
    (p: IProduct) => p.stock > 0,
  );
  const [createSale, { isLoading: submitting }] = usePostDynamicMutation();

  const addToCart = (product: IProduct) => {
    const exists = cart.find((c) => c.product._id === product._id);
    if (exists) {
      setCart(
        cart.map((c) =>
          c.product._id === product._id
            ? { ...c, quantity: Math.min(c.quantity + 1, product.stock) }
            : c,
        ),
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQty = (productId: string, qty: number) => {
    const item = cart.find((c) => c.product._id === productId);
    if (!item) return;
    if (qty < 1) return;
    if (qty > item.product.stock) {
      toast.warning(`Max stock: ${item.product.stock}`);
      return;
    }
    setCart(
      cart.map((c) =>
        c.product._id === productId ? { ...c, quantity: qty } : c,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((c) => c.product._id !== productId));
  };

  const grandTotal = cart.reduce(
    (sum, c) => sum + c.product.sellingPrice * c.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error("Add at least one product");
    try {
      const payload = {
        items: cart.map((c) => ({
          product: c.product._id,
          quantity: c.quantity,
        })),
      };
      await createSale({ url: "/sale", data: payload }).unwrap();
      refetch();
      toast.success("Sale created successfully!");
      setCart([]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Sale failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Sale"
        subtitle="Select products and quantities"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Select Products</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-800 rounded-lg animate-pulse"
                />
              ))
            ) : products.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                No products found
              </p>
            ) : (
              products.map((p) => {
                const inCart = cart.find((c) => c.product._id === p._id);
                return (
                  <div
                    key={p._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      inCart
                        ? "border-violet-600/50 bg-violet-600/10"
                        : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                    }`}
                    onClick={() => addToCart(p)}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {p.name}
                      </p>
                      <p className="text-slate-400 text-xs">{p.sku}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-400 font-semibold text-sm">
                        ৳{p.sellingPrice}
                      </p>
                      <Badge className="bg-slate-700 text-slate-300 text-xs mt-0.5">
                        {p.stock} left
                      </Badge>
                    </div>
                    {inCart && (
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {inCart.quantity}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cart / Order Summary */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-semibold">Order Summary</h2>
            <Badge className="ml-auto bg-violet-600/20 text-violet-400 border-violet-600/30">
              {cart.length} items
            </Badge>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Click products to add</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-slate-800 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium leading-tight">
                      {item.product.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(item.product._id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="text-white text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.product._id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-emerald-400 font-semibold text-sm">
                      ৳
                      {(
                        item.product.sellingPrice * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grand Total */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300 font-medium">Grand Total</span>
              <span className="text-white text-xl font-bold">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={cart.length === 0 || submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 font-semibold"
            >
              {submitting ? "Processing..." : "Confirm Sale"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSale;
