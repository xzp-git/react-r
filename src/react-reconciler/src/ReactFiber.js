import { HostRoot, HostText } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";

/**
 *
 * @param {fiber的类型} tag 函数组件 0   类组件 1   原生组件 5 根元素3
 * @param {等待更新的props} pendingProps
 * @param {虚拟dom的key} key
 */
export function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.key = key;
  this.type = null; //fiber 类型， 来自于 虚拟DOM节点的type  span  div p

  //   每个虚拟DOM   =>  Fiber节点   =>  真实DOM

  this.stateNode = null; //此fiber对应的真实DOM节点  h1 => 真实的h1DOM

  this.return = null;
  this.child = null;
  this.sibling = null;
  // fiber 哪来的？ 通过虚拟DOM节点创建，虚拟DOM会提供pendingProps用来创建fiber节点的属性
  this.pendingProps = pendingProps; //等待生效的属性
  this.memoizedProps = null; //已经生效的属性

  //   每个fiber还会有自己的状态，每一种fiber 状态存的类型是不一样的
  // 类组件对应的fiber 存的就是类的实例的状态，HostRoot 存的就是要渲染的元素
  this.memoizedState = null;

  this.updateQueue = null;

  //   副作用标识，表示要针对此fiber节点进行何种操作
  this.flags = NoFlags;
  //   子节点对应的副作用标识  副作用 就是指 对DOM节点的操作
  this.subtreeFlags = NoFlags;

  // 替身， 轮替
  this.alternate = null;

  this.index = 0;
}

export function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
}

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}

export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
  }
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  return workInProgress;
}

export function createFiberFromText(content) {
  return createFiber(HostText, content, null);
}
