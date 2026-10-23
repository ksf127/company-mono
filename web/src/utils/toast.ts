import { APP_EVENTS } from '../api/client';

export type ToastType = 'success' | 'error';

/** 通过全局事件触发提示，任何模块都可以直接调用 */
export function showToast(message: string, type: ToastType = 'success'): void {
  window.dispatchEvent(new CustomEvent(APP_EVENTS.toast, { detail: { message, type } }));
}
