import {
  registerSimpleEvents,
  topLevelEventsToReactNames,
} from "../DOMEventProperties";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { accumulateSinglePhaseListeners } from "../DOMPluginEventSystem";
import { SyntheticMouseEvent } from "../SyntheticEvent";

/**
 * 把要执行的回调函数添加到dispatchQueue中
 * @param {*} dispatchQueue 派发队列 里面防止我们的监听函数
 * @param {*} domEventName
 * @param {*} targetInst
 * @param {*} nativeEvent
 * @param {*} nativeEventTarget
 * @param {*} eventSystemFlags
 * @param {*} targetContainer
 */
export function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  const reactName = topLevelEventsToReactNames.get(domEventName);

  let SyntheticEventCtor; // 合成事件的构造函数

  switch (domEventName) {
    case "click":
      SyntheticEventCtor = SyntheticMouseEvent;
      break;

    default:
      break;
  }

  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase
  );

  // [子捕获，父捕获]
  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(
      reactName,
      domEventName,
      targetInst,
      nativeEvent,
      nativeEventTarget
    );
    dispatchQueue.push({
      event, // 合成事件的实列
      listeners, //监听函数数组
    });
  }
}

export { registerSimpleEvents as registerEvents };
