import {
  insertBefore,
  commitUpdate,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { MutationMask, Placement, Update } from "./ReactFiberFlags";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";

/**
 * 遍历fiber树，执行fiber上的副作用
 * @param {*} finishedWork
 * @param {*} root
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case FunctionComponent:
    case HostRoot:

    case HostText: {
      // 先遍历他们的子节点，处理他们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);

      //  再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      break;
    }
    // 需要处理更新逻辑
    case HostComponent: {
      // 先遍历他们的子节点，处理他们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);

      //  再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      // 处理DOM更新
      if (flags & Update) {
        // 获取真实DOM
        const instance = finishedWork.stateNode;
        if (instance !== null) {
          const newProps = finishedWork.memoizedProps;
          const oldProps = current !== null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          const updatePayload = finishedWork.updateQueue;
          finishedWork.updateQueue = null;
          if (updatePayload) {
            commitUpdate(
              instance,
              updatePayload,
              type,
              oldProps,
              newProps,
              finishedWork
            );
          }
        }
      }
      break;
    }

    default:
      break;
  }
}

function recursivelyTraverseMutationEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
}

function commitReconciliationEffects(finishedWork) {
  const { flags } = finishedWork;
  if (flags & Placement) {
    // 进行插入操作，也就是把此fiber对应的真实DOM节点添加到父真实DOM真实节点上
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

function getHostParentFiber(fiber) {
  let parent = fiber.return;

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
  return parent;
}

/**
 * 把子节点的真实dom插入到父节点中
 * @param {*} node
 * @param {*} parent
 */

function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node;
  const isHost = tag === HostComponent || tag === HostText;

  if (isHost) {
    const { stateNode } = node;
    insertBefore(parent, stateNode, before);
  } else {
    const { child } = node;
    if (child) {
      insertOrAppendPlacementNode(child, before, parent);
      let { sibling } = child;
      while (sibling) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

/**
 * 找到要插入的锚点
 * 找到可以插在它的前面的马哥fiber对应的真实DOM
 * @param {*} fiber
 */
function getHostSibling(fiber) {
  let node = fiber;
  sibling: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }
      node = node.return;
    }
    node = node.sibling;

    // 如果弟弟不是 原生节点也不是文本节点
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果此节点是一个将要插入的新的节点，就不向下找他的儿子了要跳过本次循环找它的弟弟
      if (node.flags & Placement) {
        continue sibling;
      } else {
        node = node.child;
      }
    }

    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
  }
}

/**
 * 把此fiber的真实DOM插入到父DOm节点中
 * @param {*} finishedWork
 */

function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostRoot:
      {
        const parent = parentFiber.stateNode.containerInfo;
        const before = getHostSibling(finishedWork);
        insertOrAppendPlacementNode(finishedWork, before, parent);
      }
      break;
    case HostComponent:
      {
        const parent = parentFiber.stateNode;
        const before = getHostSibling(finishedWork);
        insertOrAppendPlacementNode(finishedWork, before, parent);
      }
      break;
    default:
      break;
  }
}

/*

模兜是一站式的数据标注众包平台，在这里发布需求，获取专家和大众的智慧，共同开发创新解决方案。模兜的目标是通过高效的供需匹配、一站式创意服务流程，帮助您实现最佳的创意落地。

参与模兜平台从0-1的建设，包括PC用户端与管理端，并且独立完成了模兜小程序从0-1的建设。
接入内部视频云平台，封装独立的上传hooks和对应的资源url转化方法为公共包被其他三端复用，每次请求到的url都具有过期时间，增加了资源盗用成本。
接入内部告警监控系统，接入初期发现并修复P2、P3类bug数10+，每周进行告警复盘，提升系统的健康度。
优化打包产物，BundleSize由12.4MB减少到11.3MB,减少了10.74%，首屏Initial Js Size由2.65MB减少到1.68MB,减少了38.42%，首屏Initial Css Size由588KB减少到511KB,减少了15.27%
，重复依赖包数量减少了12。
优化web关键性能指标，FCP由1.0S减少到0.7S，LCP由3.7S减少到1.8S，FSI由2.8S减少到1.7S

从0-1独立完成会议室系统的前端、后端项目的搭建。
独立完成数据库表结构和关系的设计，以及登录认证与接口鉴权的设计。
封装全局日志模块与日志拦截器实现日志的记录、封装全局redis模块、抽离redis、mysql等等的配置，实现多环境多配置。
完成邮箱验证码登录，双token无感刷新登录状态，鉴权中间件的开发。
使用swagger自动生成接口文档，完成后端与前端的部署。
*/
