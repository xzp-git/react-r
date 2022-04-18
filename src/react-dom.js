import { REACT_TEXT, ReactComponent } from "./constants"
import {addEvent} from './event'

function render(vdom, container) {
  mount(vdom, container)
}

/**
 * 把虚拟DOM转成真实DOM插入容器中
 * @param {*} vdom 虚拟DOM
 * @param {*} container 容器
 */
function mount(vdom, container) {
  let newDOM = createDOM(vdom)
  container.appendChild(newDOM)
}
/**
 * 根据虚拟DOM转成真实DOM
 * @param {*} vdom 
 */
function createDOM(vdom) {
  let {type, props, ref} = vdom
  let dom //真实DOM
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
  }else if(typeof type === 'function'){
    if (type.isReactComponent === ReactComponent) {
      return mountClassComponent(vdom)
    }else{
      return mountFunctionComponent(vdom)
    }
  }else{
    dom = document.createElement(type)
  }
  if (props) {
    updateProps(dom, {}, props)
    const children = props.children
    if (typeof children === 'object' && children.type) {
      mount(children, dom)
    }else if(Array.isArray(children)){
      reconcileChildren(children, dom)
    }
  }
  vdom.dom = dom //让vdom的dom属性指向真实的DOM

  if(ref) ref.current = dom
  return dom
}

function mountFunctionComponent(vdom) {
  let {type, props} = vdom

  let renderVdom = type(props)
  //记住老的虚拟dom 方便后面domdiff
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function mountClassComponent(vdom) {
  let {type:ClassComponent, props, ref} = vdom
  
  let classInstance = new ClassComponent(props)
  if(ref) ref.current = classInstance
  let renderVdom = classInstance.render()
  vdom.classInstance = classInstance
  //把上一次render渲染的vdom保留
  vdom.oldRenderVdom = classInstance.oldRenderVdom =renderVdom
  return createDOM(renderVdom)
}

function reconcileChildren(children, parentDOM) {
  children.forEach((child) => {
    mount(child, parentDOM)
  })
}

/**
 * 跟新真实DOM的属性
 * @param {*} dom 
 * @param {*} oldProps 
 * @param {*} newProps 
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  for(let key in newProps){
    //属性中的children属性不在此处理
    if (key === 'children') {
      continue
    }else if (key === 'style') {
      let styleObj = newProps[key]
      for(let attr in styleObj){
        dom.style[attr] = styleObj[attr]
      }
    }else if(/^on[A-Z].*/.test(key)){
      // dom[key.toLowerCase()] = newProps[key]
      addEvent(dom, key.toLowerCase(), newProps[key])
    }else{
       dom[key] = newProps
    }
  }
  //如果属性在老的属性里，新的属性没有，需要从真实DOM中删除
  for(let key in oldProps){
    if(!newProps.hasOwnProperty(key)){
      dom[key] = null
    }
  }
}



/**
 * dom diff 对比
 * @param {*} parentDom 
 * @param {*} oldVdom 
 * @param {*} newVdom 
 */
export function compareTwoVdom(parentDom, oldVdom, newVdom) {
  
  //获取老的真实DOM
  let oldDOM = findDom(oldVdom)
  let newDom = createDOM(newVdom)
  parentDom.replaceChild(newDom, oldDOM)
}
 
export function findDom(vdom) {
  if(!vdom) return vdom

  //如果有dom说明是原生标签 span div
  if (vdom.dom) {
    return vdom.dom
  }else{
    let oldRenderVdom = vdom.oldRenderVdom
    return findDom(oldRenderVdom)
  }
  
  
}

const ReactDOM = {
  render
}

export default ReactDOM