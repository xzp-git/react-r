
import {createFiberRoot} from './ReactFiberRoot'


/**
 * 创建容器
 * @param {容器信息} containerInfo 
 * @return {FiberRootNode} 返回FiberRootNode的实例 
 */
export function createContainer(containerInfo) {
    // 创建fiber根元素
    return createFiberRoot(containerInfo)
}