import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";
import type { CartLine } from "@/lib/CartContext";

export default function OrderSummary({
  lines,
  subtotal,
}: {
  lines: CartLine[];
  subtotal: number;
}) {
  return (
    <div className="space-y-5">
      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={`${line.id}-${line.size}`} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
              <ProductImage src={line.image} alt={line.name} className="h-full w-full" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-medium text-white">
                {line.qty}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{line.name}</div>
              {line.size && (
                <div className="text-xs text-neutral-500">Size {line.size}</div>
              )}
            </div>
            <div className="shrink-0 text-sm">
              {formatPrice(line.price * line.qty)}
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Shipping</span>
          <span>Free</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between border-t border-neutral-200 pt-4">
        <span className="text-sm font-medium">Total</span>
        <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
