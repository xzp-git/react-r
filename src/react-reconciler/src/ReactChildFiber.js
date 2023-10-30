import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { HostComponent, IndeterminateComponent } from "./ReactWorkTags";
import { Placement } from "./ReactFiberFlags";
import {
  createFiber,
  createFiberFromText,
  createWorkInProgress,
} from "./ReactFiber";
import isArray from "shared/isArray";

/**
 *
 * @param {*} shouldTrackSideEffects 是否跟踪副作用
 */

function createChildReconcile(shouldTrackSideEffects) {
  function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  /**
   * 如果新的虚拟DOM是一个单节点的话
   *
   * @param {*} returnFiber 根fiber div#root 对应的fiber
   * @param {*} currentFirstChild 老的FunctionComponent对应的fiber
   * @param {*} element 新的虚拟DOM对象
   * @returns 返回新的第一个子fiber
   */
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    // 新的虚拟DOM的key，也就是唯一标准
    const key = element.key; // null
    let child = currentFirstChild;

    while (child !== null) {
      // 判断此老fiber对应的key和新的虚拟DOM对象的key是否一样
      if (child.key === key) {
        // 判断老fiber对应的类型和新虚拟DOM元素对应的类型是否相同
        if (child.type === element.type) {
          // 如果key一样，类型也一样，则认为此节点可以复用
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        }
      }
      child = child.sibling;
    }

    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  /**
   * 设置副作用
   * @param {*} newFiber
   */
  function placeSingleChild(newFiber) {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // 要在最后的提交阶段插入此节点 React渲染分成渲染（创建fiber树）和 提交（更新真实的DOM）两个阶段
      newFiber.flags |= Placement;
    }
    return newFiber;
  }

  function createChild(returnFiber, newChild) {
    if (typeof newChild === "string" && newChild !== "") {
      const created = createFiberFromText(`${newChild}`);
      created.return = returnFiber;
      return created;
    }

    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          const created = createFiberFromElement(newChild);
          created.return = returnFiber;
          return created;

        default:
          break;
      }
    }

    return null;
  }

  function placeChild(newFiber, newIndex) {
    newFiber.index = newIndex;
    if (shouldTrackSideEffects) {
      // 如果一个fiber它的flags上有Placement,说明此节点需要创建真实DOM并且插入到父容器中
      // 如果父fiber节点是初次挂载，shouldTrackSideEffects = false 不需要添加flags
      // 这种情况会在完成阶段把所有的子节点全部添加到自己身上
      newFiber.flags = Placement;
    }
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild = null; // 返回的第一个新儿子
    let previousNewFiber = null; //上一个的一个新的fiber
    let newIndex = 0;

    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex]);
      if (newFiber === null) continue;
      placeChild(newFiber, newIndex);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }

    return resultingFirstChild;
  }

  /**
   * 比较子fibers DOM-DIFF 就是用老的子fiber链表和新的虚拟DOM进行比较的过程
   * @param {*} returnFiber 新的父fiber
   * @param {*} currentFirstChild 老fiber第一个子fiber current 一般来说指的是老
   * @param {*} newChild 新的子虚拟DOM h1虚拟DOm
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );

        default:
          break;
      }
    }
    // newChild是数组的情况 [hello文本节点，span虚拟DOM元素]
    if (isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }

    return null;
  }

  return reconcileChildFibers;
}

/**
 * 根据虚拟DOM创建Fiber节点
 * @param {*} element
 */

function createFiberFromElement(element) {
  const { type, key, props: pendingProps } = element;

  return createFiberFromTypeAndProps(type, key, pendingProps);
}

function createFiberFromTypeAndProps(type, key, pendingProps) {
  let tag = IndeterminateComponent;

  if (typeof type === "string") {
    tag = HostComponent;
  }

  const fiber = createFiber(tag, pendingProps, key);

  fiber.type = type;
  return fiber;
}

export const mountChildFibers = createChildReconcile(false);
export const reconcileChildFibers = createChildReconcile(true);
