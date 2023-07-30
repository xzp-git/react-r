import { HostRoot } from "./ReactWorkTags";

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
  //   子节点对应的副作用标识
  this.subtreeFlags = NoFlags;
  this.alternate = null;
}

export function createFiber() {
  return new FiberNode(tag, pendingProps, key);
}

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}
