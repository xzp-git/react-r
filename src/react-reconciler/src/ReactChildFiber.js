import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { HostComponent, IndeterminateComponent } from "./ReactWorkTags";
import { Placement } from "./ReactFiberFlags";
import { createFiber } from "./ReactFiber";

/**
 *
 * @param {*} shouldTrackSideEffects 是否跟踪副作用
 */

function createChildReconcile(shouldTrackSideEffects) {
  function reconcileSingleElement(returnFiber, curretnFirstFiber, element) {
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  /**
   * 设置副作用
   * @param {*} newFiber
   */
  function placeSingleChild(newFiber) {
    if (shouldTrackSideEffects) {
      // 要在最后的提交阶段插入此节点 React渲染分成渲染（创建fiber树）和 提交（更新真实的DOM）两个阶段
      newFiber.flags |= Placement;
    }
    return newFiber;
  }

  /**
   * 比较子fibers DOM-DIFF 就是用老的子fiber链表和新的虚拟DOM进行比较的过程
   * @param {*} returnFiber 新的父fiber
   * @param {*} curretnFirstFiber 老fiber第一个子fiber current 一般来说指的是老
   * @param {*} newChild 新的子虚拟DOM h1虚拟DOm
   */
  function reconcileChildFibers(returnFiber, curretnFirstFiber, newChild) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, curretnFirstFiber, newChild)
          );

        default:
          break;
      }
    }
  }

  return reconcileChildFibers;
}

export const mountChildFibers = createChildReconcile(false);
export const reconcileChildFibers = createChildReconcile(true);

/**
 * 根据虚拟DOM创建Fiber节点
 * @param {*} element
 */

function createFiberFromElement(element) {
  const { type, key, pendingProps } = element;

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
