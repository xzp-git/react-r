import { insertBefore } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { MutationMask, Placement } from "./ReactFiberFlags";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

/**
 * 遍历fiber树，执行fiber上的副作用
 * @param {*} finishedWork
 * @param {*} root
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
  switch (finishedWork.tag) {
    case HostRoot:
    case HostComponent:
    case HostText:
      // 先遍历他们的子节点，处理他们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);

      //  再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      break;

    default:
      break;
  }
}

function recursivelyTraverseMutationEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
}

function commitReconciliationEffects(finishedWork) {
  const { flags } = finishedWork;
  if (flags & Placement) {
    // 进行插入操作，也就是把此fiber对应的真实DOM节点添加到父真实DOM真实节点上
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

function getHostParentFiber(fiber) {
  let parent = fiber.return;

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
  return parent;
}

/**
 * 把子节点的真实dom插入到父节点中
 * @param {*} node
 * @param {*} parent
 */

function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node;
  const isHost = tag === HostComponent || tag === HostText;

  if (isHost) {
    const { stateNode } = node;
    insertBefore(parent, stateNode, before);
  } else {
    const { child } = node;
    if (child) {
      insertNode(child, parent);
      let { sibling } = child;
      while (sibling) {
        insertNode(sibling, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

/**
 * 找到要插入的锚点
 * 找到可以插在它的前面的马哥fiber对应的真实DOM
 * @param {*} fiber
 */
function getHostSibling(fiber) {}

/**
 * 把此fiber的真实DOM插入到父DOm节点中
 * @param {*} finishedWork
 */

function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostRoot:
      {
        const parent = parentFiber.stateNode.containerInfo;
        const before = getHostSibling(finishedWork); //获取最近的弟弟真实DOM节点
        insertOrAppendPlacementNode(finishedWork, before, parent);
      }
      break;
    case HostComponent:
      {
        const parent = parentFiber.stateNode;
        const before = getHostSibling(finishedWork);
        insertOrAppendPlacementNode(finishedWork, before, parent);
      }
      break;
    default:
      break;
  }
}
