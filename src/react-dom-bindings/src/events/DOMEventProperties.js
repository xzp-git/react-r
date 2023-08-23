import { registerTwoPhaseEvent } from "./EventRegistry";

const simpleEventPluginEvents = ["click"];
export const topLevelEventsToReactNames = new Map();

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]; //'click'
    const domEventName = eventName.toLowerCase(); //'click'
    const capitalizeEvent = eventName[0].toUpperCase() + eventName.slice(1); //'Click'
    registerSimpleEvent(domEventName, `on${capitalizeEvent}`);
  }
}

function registerSimpleEvent(domEventName, reactName) {
  // onClick在哪里可以取到

  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}
