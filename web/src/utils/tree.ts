/** 把树形数据拍平，并记录层级深度，供树形表格与下拉框使用 */
export function flattenTree<T>(
  nodes: T[],
  getChildren: (node: T) => T[] | undefined,
  depth = 0,
  result: Array<{ node: T; depth: number }> = [],
): Array<{ node: T; depth: number }> {
  nodes.forEach((node) => {
    result.push({ node, depth });
    const children = getChildren(node);
    if (children && children.length > 0) {
      flattenTree(children, getChildren, depth + 1, result);
    }
  });
  return result;
}

/** 统计树节点总数 */
export function countTree<T>(nodes: T[], getChildren: (node: T) => T[] | undefined): number {
  return nodes.reduce((total, node) => {
    const children = getChildren(node);
    return total + 1 + (children ? countTree(children, getChildren) : 0);
  }, 0);
}
