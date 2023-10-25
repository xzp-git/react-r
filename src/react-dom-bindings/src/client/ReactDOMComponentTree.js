const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = "__reactFiber$" + randomKey;
const internalPropskey = "__reactProps$" + randomKey;

/**
 * 从真实的DOM节点上获取他对应的fiber节点
 * @param {*} targetNode
 */
export function getClosestInstanceFromNode(targetNode) {
  const targetInst = targetNode[internalInstanceKey];
  if (targetInst) {
    return targetInst;
  }
  return null;
}

export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}

export function updateFiberProps(node, props) {
  node[internalPropskey] = props;
}

export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropskey] || null;
}
