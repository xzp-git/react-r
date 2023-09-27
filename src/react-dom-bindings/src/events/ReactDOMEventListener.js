import { getEventTarget } from "./getEventTarget";
import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem";

export function createEventListenerWrapperWithPriority(
  targetContainer,
  domEventName,
  eventSystemFlags
) {
  const listenerWrapper = dispatchDiscretEvent;
  return listenerWrapper.bind(
    null,
    targetContainer,
    domEventName,
    eventSystemFlags
  );
}

/**
 * 派发离散的事件的监听函数
 * @param {*} targetContainer 容器div#root
 * @param {*} domEventName 事件名 click
 * @param {*} eventSystemFlags 阶段 0 冒泡 4 捕获
 * @param {*} nativeEvent 原生事件
 */
function dispatchDiscretEvent(
  targetContainer,
  domEventName,
  eventSystemFlags,
  nativeEvent
) {
  dispatchEvent(targetContainer, domEventName, eventSystemFlags, nativeEvent);
}

/**
 *  此方法就是委托给容器的回调，当容器#root在捕获或者冒泡阶段处理事件的时候会执行此函数
 * @param {*} targetContainer
 * @param {*} domEventName
 * @param {*} eventSystemFlags
 * @param {*} nativeEvent
 */
export function dispatchEvent(
  targetContainer,
  domEventName,
  eventSystemFlags,
  nativeEvent
) {
  // 获取事件源 例如 span
  const nativeEventTarget = getEventTarget(nativeEvent);

  const targetInst = getClosestInstanceFromNode(nativeEventTarget);

  dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer
  );
}
