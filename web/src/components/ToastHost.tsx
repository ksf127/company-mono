import { useEffect, useState } from 'react';
import { APP_EVENTS } from '../api/client';
import type { ToastType } from '../utils/toast';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let sequence = 0;

/**
 * 全局提示容器：监听统一错误事件与页面主动提示，3 秒后自动消失。
 */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const push = (message: string, type: ToastType) => {
      const id = sequence + 1;
      sequence = id;
      setItems((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 3200);
    };

    const handleError = (event: Event) => {
      push((event as CustomEvent<string>).detail, 'error');
    };
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; type: ToastType }>).detail;
      push(detail.message, detail.type);
    };

    window.addEventListener(APP_EVENTS.error, handleError);
    window.addEventListener(APP_EVENTS.toast, handleToast);
    return () => {
      window.removeEventListener(APP_EVENTS.error, handleError);
      window.removeEventListener(APP_EVENTS.toast, handleToast);
    };
  }, []);

  return (
    <div className="toast-host" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
