import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/ReactFiberReconciler";
// reconciler 协调器

/**
 *
 * @param {FiberRootNode的实例 } internalRoot
 */
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  updateContainer(children, root);
};

/**
 * 创建  react 根元素
 * @param {页面中的挂载dom元素} container
 * @returns
 */
export function createRoot(container) {
  //创建容器
  // @return {FiberRootNode} 返回FiberRootNode的实例
  const root = createContainer(container);

  return new ReactDOMRoot(root);
}
