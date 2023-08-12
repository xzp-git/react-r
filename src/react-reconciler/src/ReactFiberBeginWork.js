import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
/**
 * 目标是根据新虚拟DOM构建新的Fiber子链表 child sibling
 * @param {*} current 老的fiber
 * @param {*} workInProgress 新的fiber
 */

export function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return null;
    default:
      return null;
  }
}

function updateHostRoot(current, workInProgress) {
  // 需要知道他的子虚拟DOm， 知道他的儿子的虚拟Dom信息
  processUpdateQueue(workInProgress); //workInProgress.memoizedState = {element}
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;
  debugger;
  //   协调子节点DOM-Diff算法
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostComponent(params) {}

/**
 * 根据新的虚拟DOm生成新的fiber链表
 * @param {*} current
 * @param {*} workInProgress
 * @param {*} nextChildren
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  // 如果此新fiber没u有老的fiber，说明此新fiber是创建的
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // 如果有老fiber的话，作DOM-DIFF 拿老的子fiber链表和新的子虚拟DOM进行比较，进行最小化的更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}
