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
}
