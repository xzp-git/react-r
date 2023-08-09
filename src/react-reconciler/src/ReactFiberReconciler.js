import { createFiberRoot } from "./ReactFiberRoot";
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue";
import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

/**
 * 创建容器
 * @param {容器信息} containerInfo
 * @return {FiberRootNode} 返回FiberRootNode的实例
 */
export function createContainer(containerInfo) {
  // 创建fiber根元素
  return createFiberRoot(containerInfo);
}

/**
 *
 * 更新容器，把虚拟dom element变成真实dom插入到container容器中
 * @param {虚拟dom} element
 * @param {dom容器} container
 */
export function updateContainer(element, container) {
  // 获取当前的根fiber
  const current = container.current; //指向根fiber
  // 创建更新
  const update = createUpdate();
  // 要更新的虚拟DOM
  update.payload = { element };
  //把此更新对象添加到current这个根fiber的更新队列上
  enqueueUpdate(current, update);

  //返回根节点 从当前的fiber一直到根节点
  return markUpdateLaneFromFiberToRoot(current);
}
