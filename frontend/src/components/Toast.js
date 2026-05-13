import React, { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import './Toast.css';

export const ToastContainer = () => {
    const { toasts, removeToast } = useContext(ToastContext);

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast--${toast.type}`}
                >
                    <div className="toast__content">
                        <span className="toast__message">{toast.message}</span>
                        <button
                            className="toast__close"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Cerrar notificación"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

