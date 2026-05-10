import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CartDialogProps {
    onCheckout: () => void;
}

export function CartDialog({ onCheckout }: CartDialogProps) {
    const { cart, isCartOpen, setCartOpen, removeFromCart, updateCartQuantity, getCartTotal } = useAppStore();

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setCartOpen(false);
        onCheckout();
    };

    return (
        <Dialog open={isCartOpen} onOpenChange={setCartOpen}>
            <DialogContent className="bg-card border-primary/30 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        سلة التسوق
                    </DialogTitle>
                </DialogHeader>

                {cart.length > 0 ? (
                    <div className="space-y-4">
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {cart.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-foreground font-medium">{item.name}</p>
                                        <p className="text-primary">{item.price} ر.س</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                            className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-foreground w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-red-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-primary/20 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-foreground">الإجمالي</span>
                                <span className="text-2xl font-bold text-primary">{getCartTotal()} ر.س</span>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                className="w-full bg-primary text-black font-semibold"
                            >
                                إتمام الطلب
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">السلة فارغة</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
