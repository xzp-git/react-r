import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { renderWithHooks } from "./ReactFiberHooks";

/**
 * 挂载函数组件
 * @param {*} current 老fiber
 * @param {*} workInProgress 新的fiber
 * @param {*} Component 组件类型 也就是函数组件的定义
 */

export function mountIndeterminateComponent(
  current,
  workInProgress,
  Component
) {
  const props = workInProgress.pendingProps;
  // const value = Component(props);
  const value = renderWithHooks(current, workInProgress, Component, props);
  workInProgress.tag = FunctionComponent;
  reconcileChildren(current, workInProgress, value);
  return workInProgress.child;
}

export function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  newProps
) {
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    newProps
  );
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 目标是根据新虚拟DOM构建新的Fiber子链表 child sibling
 * @param {*} current 老的fiber
 * @param {*} workInProgress 新的fiber
 */

export function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type
      );
    case FunctionComponent: {
      const Component = workInProgress.type;
      const newProps = workInProgress.pendingProps;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        newProps
      );
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return null;
    default:
      return null;
  }
}

function updateHostRoot(current, workInProgress) {
  // 需要知道他的子虚拟DOm， 知道他的儿子的虚拟Dom信息
  processUpdateQueue(workInProgress); //workInProgress.memoizedState = {element}
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;
  //   协调子节点DOM-Diff算法
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 构建原生组件的子fiber链表
 * @param {*} current
 * @param {*} workInProgress
 * @returns
 */

function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress;
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  // 判断当前虚拟DOm它的儿子是不是一个文本独生子
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 根据新的虚拟DOm生成新的fiber链表
 * @param {*} current
 * @param {*} workInProgress
 * @param {*} nextChildren
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  // 如果此新fiber没u有老的fiber，说明此新fiber是创建的
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // 如果有老fiber的话，作DOM-DIFF 拿老的子fiber链表和新的子虚拟DOM进行比较，进行最小化的更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}
