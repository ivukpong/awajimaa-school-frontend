import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FeaturedStudent } from '@/hooks/useSponsorshipCart';

const CART_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export interface CartItem {
    student: FeaturedStudent;
    amount: number;
}

interface SponsorshipCartStore {
    items: CartItem[];
    expiresAt: number | null; // epoch ms

    addStudent: (student: FeaturedStudent) => void;
    removeStudent: (studentId: number) => void;
    updateAmount: (studentId: number, amount: number) => void;
    clearCart: () => void;
    isExpired: () => boolean;
    totalStudents: () => number;
    subtotal: () => number;
}

export const useSponsorshipCartStore = create<SponsorshipCartStore>()(
    persist(
        (set, get) => ({
            items: [],
            expiresAt: null,

            addStudent: (student) => {
                const { items, expiresAt, isExpired } = get();
                if (isExpired()) {
                    // Reset expired cart
                    set({
                        items: [{ student, amount: student.suggested_amount || 5000 }],
                        expiresAt: Date.now() + CART_TTL_MS,
                    });
                    return;
                }
                if (items.some((i) => i.student.id === student.id)) return;
                set({
                    items: [...items, { student, amount: student.suggested_amount || 5000 }],
                    expiresAt: expiresAt ?? Date.now() + CART_TTL_MS,
                });
            },

            removeStudent: (studentId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.student.id !== studentId),
                })),

            updateAmount: (studentId, amount) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.student.id === studentId ? { ...i, amount } : i
                    ),
                })),

            clearCart: () => set({ items: [], expiresAt: null }),

            isExpired: () => {
                const { expiresAt } = get();
                return expiresAt !== null && Date.now() > expiresAt;
            },

            totalStudents: () => get().items.length,

            subtotal: () =>
                get().items.reduce((sum, i) => sum + i.amount, 0),
        }),
        {
            name: 'awajimaa-sponsorship-cart',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state?.isExpired()) {
                    state.clearCart();
                }
            },
        }
    )
);
