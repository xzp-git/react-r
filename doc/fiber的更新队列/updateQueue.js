function initialUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = queue;
}

function createUpdate() {
  return {};
}

function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  const shared = updateQueue.shared;
  if (!shared.pending) {
    update.next = update;
  } else {
    update.next = shared.pending.next;
    shared.pending.next = update;
  }
  shared.pending = update;
}

function getStateFromUpdate(update, newState) {
  return Object.assign({}, newState, update.payload);
}

function processUpdateQueue(fiber) {
  const queue = fiber.updateQueue;
  const pending = queue.shared.pending;
  if (pending !== null) {
    queue.shared.pending = null;

    //最后一个更新
    const lastPendingUpdate = pending;
    //第一个更新
    const firstPendingUpdate = lastPendingUpdate.next;

    // 把环状链接剪开
    lastPendingUpdate.next = null;

    let newState = fiber.memoizedState;
    let update = firstPendingUpdate;
    while (update) {
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }
    fiber.memoizedState = newState;
  }
}

let fiber = { memoizedState: { id: 1 } };

initialUpdateQueue(fiber);

let update1 = createUpdate();
update1.payload = { name: "foo" };
enqueueUpdate(fiber, update1);
let update2 = createUpdate();
update2.payload = { age: 26 };
enqueueUpdate(fiber, update2);
processUpdateQueue(fiber);
console.log(fiber.memoizedState);
