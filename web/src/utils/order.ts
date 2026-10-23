/** 订单状态展示配置，页面与仪表盘共用 */
export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  CREATED: { label: '待支付', tone: 'warning' },
  PAID: { label: '已支付', tone: 'info' },
  SHIPPED: { label: '已发货', tone: 'primary' },
  COMPLETED: { label: '已完成', tone: 'success' },
  CANCELLED: { label: '已取消', tone: 'muted' },
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS[status]?.label ?? status;
}

export function orderStatusTone(status: string): string {
  return ORDER_STATUS[status]?.tone ?? 'muted';
}
