import React from 'react';
import { useAppStore } from '@/store/appStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    onRedirect: (page: string) => void;
}

export function ProtectedRoute({ children, allowedRoles, onRedirect }: ProtectedRouteProps) {
    const { isAuthenticated, currentUser } = useAppStore();

    React.useEffect(() => {
        if (!isAuthenticated) {
            onRedirect('login');
            return;
        }

        if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
            onRedirect('home');
            return;
        }
    }, [isAuthenticated, currentUser, allowedRoles, onRedirect]);

    if (!isAuthenticated) return null;
    if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) return null;

    // Additional check for delivery agents approval
    if (currentUser?.role === 'delivery' && currentUser.isApproved === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-royal-gradient text-foreground p-4 text-center">
                <div className="card-royal p-8 max-w-md">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-4">حسابك قيد المراجعة</h2>
                    <p className="text-muted-foreground mb-6">
                        شكراً لتسجيلك كمندوب. حسابك الآن قيد المراجعة من قبل الإدارة. سيتم تفعيل دخولك فور الموافقة عليه.
                    </p>
                    <button
                        onClick={() => onRedirect('home')}
                        className="text-primary hover:underline font-medium"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
