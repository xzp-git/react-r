import { setInitialProperties } from "./ReactDOMComponent";

export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === "string" || typeof props.children === "number"
  );
}

export function createTextInstance(content) {
  return document.createTextNode(content);
}

export function createInstance(type) {
  const domElement = document.createElement(type);
  return domElement;
}

export function appendInitialChild(parent, child) {
  parent.appendChild(child);
}

export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
}
export function appendChild(parent, child) {
  parent.appendChild(child);
}

export function insertBefore(parent, child, beforeChild) {
  parent.insertBefore(child, beforeChild);
}
