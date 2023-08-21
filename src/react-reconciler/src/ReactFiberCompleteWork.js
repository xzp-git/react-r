import { NoFlags } from "./ReactFiberFlags";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import {
  createInstance,
  createTextInstance,
  appendInitialChild,
  finalizeInitialChildren,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";

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
      const instance = createInstance(type, newProps, workInProgress);
      // 把自己所有的儿子都添加到自己身上

      appendAllChildren(instance, workInProgress);

      workInProgress.stateNode = instance;
      finalizeInitialChildren(instance, type, newProps);
      bubblePropertier(workInProgress);
      break;
    case HostText:
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      const newText = newProps;
      workInProgress.stateNode = createTextInstance(newText);
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
