import ReactSharedInternals from "shared/ReactSharedInternals";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let workInProgressHook = null;
let currentRendering;
const HookSDispatcherOnMount = {
  useReducer: mountReducer,
};

function mountReducer(reducer, initialArg) {
  const hook = mountWorkInProgressHook();
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // hook的状态
    queue: null, // 存放本hook的更新队列 queue.pending = update的循环链表
    next: null, //  指向下个hook，一个函数里可以会有多个hook，他们会组成一个单向链表
  };

  if (workInProgressHook === null) {
    workInProgressHook = hook;
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
  // 需要在函数组件执行前 给ReactCurrentDispatcher.current赋值
  const children = Component(props);
  return children;
}
