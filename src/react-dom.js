import { REACT_TEXT } from "./constants"

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
  let {type, props} = vdom
  let dom //真实DOM
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
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
  return dom
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



const ReactDOM = {
  render
}

export default ReactDOM