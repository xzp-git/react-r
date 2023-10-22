import ReactSharedInternals from "shared/ReactSharedInternals";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { enqueuConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let workInProgressHook = null;
let currentlyRenderingFiber = null;
const HookSDispatcherOnMount = {
  useReducer: mountReducer,
};

function mountReducer(reducer, initialArg) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));
  return [hook.memoizedState, dispatch];
}

/**
 * 执行派发动作的方法，他要跟新状态，并且让界面重新更新
 * @param {*} fiber
 * @param {*} queue
 * @param {*} action
 */
function dispatchReducerAction(fiber, queue, action) {
  // 在每个hook里会存放一个更新队列，更新队列是一个更新对象的循环链表
  const update = {
    action,
    next: null,
  };
  // 把当前的最新的更新添加到更新队列中，并且返回当前的根fiber
  const root = enqueuConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root);
}

/**
 * 挂载构建中的hook
 * @returns
 */
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // hook的状态
    queue: null, // 存放本hook的更新队列 queue.pending = update的循环链表
    next: null, //  指向下个hook，一个函数里可以会有多个hook，他们会组成一个单向链表
  };

  if (workInProgressHook === null) {
    // 当前函数组件的memoizedState 指向第一个hooks
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

/**
 * 渲染函数组件
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @param {*} Component  组件定义
 * @param {*} props 组件属性
 * @returns 虚拟DOM或者说React元素
 */

export function renderWithHooks(current, workInProgress, Component, props) {
  ReactCurrentDispatcher.current = HookSDispatcherOnMount;
  currentlyRenderingFiber = workInProgress; // Function 组件对应的fiber
  // 需要在函数组件执行前 给ReactCurrentDispatcher.current赋值
  const children = Component(props);
  return children;
}
