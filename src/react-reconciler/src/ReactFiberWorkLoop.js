import { scheduleCallback } from "./scheduler";
let workInProgress = null;

/**
 * 计划更新root
 * 源码中此处有一个调度任务的功能
 * @param {*} root
 */
export function scheduleUpdateOnFiber(root) {
  //确保调度执行root上的更新
  ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
  //告诉浏览器要执行 performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 根据fiber构建fiber树，要创建真实的DOM节点，还需要把真实的DOM节点插入容器
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
  //第一次以同步的方式渲染根节点，初次渲染的时候，都是同步
  renderRootSync(root);
}

function renderRootSync(root) {
  //开始构建fiber树
}
