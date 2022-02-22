import { REACT_TEXT } from "./constants";


/**
 * 把虚拟DOM节点进行包装
 * 如果此虚拟DOM是一个文本，比如说是字符串或者数字，包装成 虚拟DOM节点对象
 * @param {*} element 
 * @returns 
 */
export function wrapToVdom(element) {
  return typeof element === 'string' || typeof element === 'number' ?
  {type:REACT_TEXT, props:element} : element
}