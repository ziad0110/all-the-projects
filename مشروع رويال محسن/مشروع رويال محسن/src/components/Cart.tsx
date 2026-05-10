import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

interface CartProps {
    onNavigate: (page: string) => void;
}

export function Cart({ onNavigate }: CartProps) {
    const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, isAuthenticated } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            onNavigate('login');
            return;
        }
        setIsOpen(false);
        onNavigate('checkout');
    };

    return (
        <>
            {/* Cart Button */}
            <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground hover:bg-primary/10"
                onClick={() => setIsOpen(true)}
            >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </motion.span>
                )}
            </Button>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-primary/20 z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-primary/20 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                    سلة المشتريات
                                </h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                        <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                                        <p>السلة فارغة</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <motion.div
                                                key={item.productId}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 100 }}
                                                className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-primary/10"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-20 h-20 rounded-lg object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-foreground">{item.name}</h3>
                                                    <p className="text-primary font-bold">{item.price} ر.س</p>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="w-8 h-8"
                                                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="w-8 text-center text-foreground">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="w-8 h-8"
                                                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-destructive hover:bg-destructive/10 mr-auto"
                                                            onClick={() => removeFromCart(item.productId)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t border-primary/20 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">الإجمالي:</span>
                                        <span className="text-2xl font-bold text-primary">{getCartTotal()} ر.س</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => clearCart()}
                                        >
                                            إفراغ السلة
                                        </Button>
                                        <Button
                                            className="flex-1 bg-primary text-black font-bold"
                                            onClick={handleCheckout}
                                        >
                                            إتمام الطلب
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
