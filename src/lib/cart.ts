export type LocalCartItem = {
    id: string;
    product_id: string;
    quantity: number;
};

export const getLocalCart = (): LocalCartItem[] => {
    try {
        const cart = localStorage.getItem('guest_cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        return [];
    }
};

export const addToLocalCart = (product_id: string, quantity: number) => {
    const cart = getLocalCart();
    const existing = cart.find(i => i.product_id === product_id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: crypto.randomUUID(), product_id, quantity });
    }
    localStorage.setItem('guest_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
};

export const updateLocalCartQty = (id: string, quantity: number) => {
    let cart = getLocalCart();
    if (quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    } else {
        const item = cart.find(i => i.id === id);
        if (item) item.quantity = quantity;
    }
    localStorage.setItem('guest_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
};

export const removeFromLocalCart = (id: string) => {
    const cart = getLocalCart().filter(i => i.id !== id);
    localStorage.setItem('guest_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
};

export const clearLocalCart = () => {
    localStorage.removeItem('guest_cart');
    window.dispatchEvent(new Event('cart_updated'));
};
