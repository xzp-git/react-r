import { REACT_ELEMENT, REACT_FRAGMENT, REACT_FORWARD_REF } from "./constants"
import { wrapToVdom } from "./utils"
import {Component} from './component'
/**
 * 
 * 用来创建React元素的工厂方法
 * @param {*} type 元素的类型
 * @param {*} config 配置对象
 * @param {*} children 儿子们
 * @returns 
 */
function createElement(type, config, children) {
  let ref, key
  if (config) {
    ref = config.ref //通过它可以获取
    key = config.key //后面会用于dom diff的移动处理
    delete config.ref
    delete config.key
    delete config.__source
    delete config.__self
  }

  let props = {...config}
  //有多个儿子 props.children就是一个数组了
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom)
  }else{
    props.children = wrapToVdom(children)
  }
  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props
  }
}

function createRef() {
  return {current:null}
}

function forwardRef(render) {
  return{
    $$typeof:REACT_FORWARD_REF,
    render
  }
}


const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  Fragment:REACT_FRAGMENT
}

export default React