/** 后端返回 ISO 时间，统一展示为 yyyy-MM-dd HH:mm:ss */
export function formatTime(value?: string | null): string {
  if (!value) {
    return '-';
  }
  return value.replace('T', ' ').slice(0, 19);
}

/** 金额展示保留两位小数 */
export function formatAmount(value?: number | null): string {
  if (value === undefined || value === null) {
    return '0.00';
  }
  return Number(value).toFixed(2);
}
