import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('السلة فارغة! أضف منتجات أولاً');
      return;
    }
    // Build WhatsApp message with order details
    const orderLines = items.map(item => `• ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ر.ي`).join('\n');
    const message = `مرحباً، أريد طلب المنتجات التالية:\n\n${orderLines}\n\nالإجمالي: ${totalPrice.toFixed(0)} ر.ي`;
    const phoneNumber = '967736499765';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('تم تحويلك إلى واتساب لإتمام الطلب!');
    clearCart();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-full sm:max-w-lg flex flex-col" dir="rtl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-2xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <ShoppingCart className="w-6 h-6 text-[#E84B8A]" />
            سلة التسوق
            {totalItems > 0 && (
              <span className="text-sm bg-[#E84B8A] text-black px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">السلة فارغة</h3>
            <p className="text-gray-500">أضف بعض المنتجات لبدء التسوق</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"
                  >
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      <Package className="w-8 h-8 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[#E84B8A] font-bold">{item.price.toFixed(2)} ر.س</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t pt-4 flex-col gap-4">
              <div className="flex justify-between items-center w-full text-lg">
                <span className="font-bold">الإجمالي:</span>
                <span className="font-black text-[#E84B8A] text-2xl">{totalPrice.toFixed(2)} ر.س</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-[#E84B8A] hover:bg-[#e5a338] text-black font-bold rounded-full py-6 text-lg"
              >
                إتمام الشراء
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-full py-4"
              >
                مواصلة التسوق
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
