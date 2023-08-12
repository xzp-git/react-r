import assign from "shared/assign";
import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

export const UpdateState = 0;

export function initialUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = queue;
}

export function createUpdate() {
  const update = { tag: UpdateState };

  return update;
}

export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  const sharedPending = updateQueue.shared.pending;

  if (sharedPending === null) {
    update.next = update;
  } else {
    update.next = sharedPending.next;
    sharedPending.next = update;
  }
  updateQueue.shared.pending = update;
  //返回根节点 从当前的fiber一直到根节点
  return markUpdateLaneFromFiberToRoot(fiber);
}

/**
 * 根据老状态和更新队中的更新计算最新的状态
 * @param {*} workInProgress
 */
export function processUpdateQueue(workInProgress) {
  const queue = workInProgress.updateQueue;
  const pendingQueue = queue.shared.pending;

  // 如果有更新，或者说更新队列里有内容

  if (pendingQueue !== null) {
    // 清除等待生效的更新
    queue.shared.pending = null;
    // 获取更新队列中最后一个更新 update = {payload:{element:'h1'}}
    const lastPendingUpdate = pendingQueue;
    // 指向第一个更新
    const firstPendingUpdate = lastPendingUpdate.next;

    // 把更新链表剪开，变成一个单链表

    lastPendingUpdate.next = null;

    // 获取老状态

    let newState = workInProgress.memoizedState;
    let update = firstPendingUpdate;

    while (update) {
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }
    workInProgress.memoizedState = newState;
  }
}

/**
 * 根据老状态和更新计算新状态
 * @param {*} update 更新的对象其实有很多中类型
 * @param {*} prevState
 */
function getStateFromUpdate(update, prevState) {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update;
      return assign({}, prevState, payload);
    default:
      return null;
  }
}
