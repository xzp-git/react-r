import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

export function initialUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = queue;
}

export function createUpdate() {
  const update = {};

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
