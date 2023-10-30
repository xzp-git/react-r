import { NoFlags, Update } from "./ReactFiberFlags";
import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
} from "./ReactWorkTags";
import {
  createInstance,
  createTextInstance,
  appendInitialChild,
  finalizeInitialChildren,
  prepareUpdate,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";

function markUpdate(workInProgress) {
  workInProgress.flags |= Update;
}

/**
 *
 * 在fiber（button）的完成阶段准备更新DOM
 * @param {*} current button 老fiber
 * @param {*} workInProgress button的新fiber
 * @param {*} type 类型
 * @param {*} newProps 新属性
 */

function updateHostComponent(current, workInProgress, type, newProps) {
  const oldProps = current.memoizedProps; // 老的属性
  const instance = workInProgress.stateNode; // 老的DOM节点
  // 比较新老属性，收集属性的差异
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  console.log(updatePayload, "updatePayload");
  // 让原生组件的新fiber更新队列等于[]
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    markUpdate(workInProgress);
  }
}

/**
 * 完成一个fiber节点
 * @param {*} current
 * @param {*} workInProgress
 */

export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case HostRoot:
      bubblePropertier(workInProgress);
      break;
    case HostComponent:
      //现在只是在处理创建或者说挂载新节点的逻辑，后面此处区分是挂载还是更新
      const { type } = workInProgress;

      // 如果老fiber存在，并且老fiber上真实DOM节点，要走节点更新的逻辑
      if (current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        const instance = createInstance(type, newProps, workInProgress);
        // 把自己所有的儿子都添加到自己身上

        appendAllChildren(instance, workInProgress);

        workInProgress.stateNode = instance;
        finalizeInitialChildren(instance, type, newProps);
      }

      bubblePropertier(workInProgress);
      break;
    case HostText:
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      const newText = newProps;
      workInProgress.stateNode = createTextInstance(newText);
      bubblePropertier(workInProgress);
      break;

    case FunctionComponent:
      bubblePropertier(workInProgress);
      break;

    default:
      break;
  }
}

/**
 * 收集子节点的副作用
 * @param {*} completedWork
 */
function bubblePropertier(completedWork) {
  let subtreeFlags = NoFlags;

  let child = completedWork.child;

  while (child) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  completedWork.subtreeFlags = subtreeFlags;
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;

  while (node) {
    // 如果子节点的类型是一个原生节点或者是一个文本节点
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
      // 如果第一个儿子不是一个原生节点，说明他可能是一个函数组件
    } else if (node.child !== null) {
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }

    // 这对如果child都是函数组件，把它的孩子节点都加入到父节点后需要再回到自己，然后去找函数组件的sibling 如果当前的节点没有弟弟
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      // 回到父节点
      node = node.return;
    }
    node = node.sibling;
  }
}
