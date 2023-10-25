import { HostRoot } from "./ReactWorkTags";

const concurrentQueue = [];
let concurrentQueueIndex = 0;

/**
 * 本来此文件要处理更新优先级的问题
 * 目前现在只实现向上找到根节点
 * @param {Fiber} sourceFiber
 */
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber;
  let parent = sourceFiber.return;
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }

  // 一直找到parent为null
  if (node.tag === HostRoot) {
    return node.stateNode; //FiberRootNode
  }

  return null;
}

/**
 * 把更新队列添加到队列中
 * @param {*} fiber 函数组件对应的fiber
 * @param {*} queue 要更新的hook对应的更新队列
 * @param {*} update 更新对象
 */
export function enqueuConcurrentHookUpdate(fiber, queue, update) {
  enqueueUpdate(fiber, queue, update);
  return getRootForUpdatedFiber(fiber);
}

function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  return node.tag === HostRoot ? node.stateNode : null; //FiberRootNode div#root
}

/**
 * 把更新先缓存到concurrentQueue数组中
 */
function enqueueUpdate(fiber, queue, update) {
  concurrentQueue[concurrentQueueIndex++] = fiber;
  concurrentQueue[concurrentQueueIndex++] = queue;
  concurrentQueue[concurrentQueueIndex++] = update;
}

export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueueIndex;
  concurrentQueueIndex = 0;
  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueue[i++];
    const queue = concurrentQueue[i++];
    const update = concurrentQueue[i++];
    if (queue !== null && update !== null) {
      const pending = queue.pending;
      if (pending === null) {
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }
      queue.pending = update;
    }
  }
}
