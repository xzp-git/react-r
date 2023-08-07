import { createHostRootFiber } from "./ReactFiber";

//简单来说 FiberRootNode = containerInfo 他的本质就是一个真实的容器DOM节点 div#root
//其实就是一个真实的DOM
function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo; //div#root
}

/**
 * 创建fiber根节点
 * @param {容器信息} containerInfo
 */
export function createFiberRoot(containerInfo) {
  const root = new FiberRootNode(containerInfo);

  //   HostRoot指的就是根节点 div#root
  const uninitializedFiber = createHostRootFiber();
  //   根容器的current指向当前的根fiber current 指的是当前根容器它的现在正在显示的或者说已经渲染好的fiber树
  root.current = uninitializedFiber;
  // 根fiber的stateNode，也就是真是DOM节点指向
  uninitializedFiber.stateNode = root;
  return root;
}
