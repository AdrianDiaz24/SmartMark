import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider');
    }

    return {
        success: (message, duration = 3000) => context.addToast(message, 'success', duration),
        error: (message, duration = 3000) => context.addToast(message, 'error', duration),
        info: (message, duration = 3000) => context.addToast(message, 'info', duration),
        warning: (message, duration = 3000) => context.addToast(message, 'warning', duration),
    };
};

