  



//简单来说 FiberRootNode = containerInfo 他的本质就是一个真实的容器DOM节点 div#root
//其实就是一个真实的DOM
function FiberRootNode(containerInfo) {
    this.containerInfo = containerInfo //div#root
}


/**
 * 创建fiber根节点
 * @param {容器信息} containerInfo 
 */
export function createFiberRoot(containerInfo) {
    const root = new FiberRootNode(containerInfo)

    return root
}