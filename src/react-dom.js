import { REACT_TEXT, PLACEMENT, MOVE, REACT_FRAGMENT,ReactComponent, REACT_FORWARD_REF } from "./constants";
import { addEvent } from "./event";

function render(vdom, container) {
  mount(vdom, container);
}

/**
 * 把虚拟DOM转成真实DOM插入容器中
 * @param {*} vdom 虚拟DOM
 * @param {*} container 容器
 */
function mount(vdom, container) {
  let newDOM = createDOM(vdom);
  container.appendChild(newDOM);
  if (newDOM.componentDidMount) {
    newDOM.componentDidMount();
  }
}
/**
 * 根据虚拟DOM转成真实DOM
 * @param {*} vdom
 */
function createDOM(vdom) {
  let { type, props, ref } = vdom;
  let dom; //真实DOM

  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vdom);
  } else if(type === REACT_FRAGMENT){
    dom = document.createDocumentFragment()
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === "function") {
    if (type.isReactComponent === ReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }
  if (typeof props === "object") {
    updateProps(dom, {}, props);
    const children = props.children;
    if (typeof children === "object" && children.type) {
      mount(children, dom);
    } else if (Array.isArray(children)) {
      reconcileChildren(children, dom);
    }
  }
  vdom.dom = dom; //让vdom的dom属性指向真实的DOM

  if (ref) ref.current = dom;
  return dom;
}
function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom;
  let renderVdom = type.render(props, ref);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

function mountFunctionComponent(vdom) {
  let { type, props } = vdom;

  let renderVdom = type(props);
  //记住老的虚拟dom 方便后面domdiff
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

function mountClassComponent(vdom) {
  let { type: ClassComponent, props, ref } = vdom;

  let classInstance = new ClassComponent(props);

  //组件将要挂载
  if (classInstance.UNSAFE_componentWillMount) {
    classInstance.UNSAFE_componentWillMount();
  }
  if (ref) ref.current = classInstance;
  let renderVdom = classInstance.render();
  vdom.classInstance = classInstance;
  //把上一次render渲染的vdom保留
  vdom.oldRenderVdom = classInstance.oldRenderVdom = renderVdom;

  let dom = createDOM(renderVdom);

  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  }

  return dom;
}

function reconcileChildren(children, parentDOM) {
  children.forEach((child, index) => {
    child.mountIndex = index
    mount(child, parentDOM);
  });
}

/**
 * 跟新真实DOM的属性
 * @param {*} dom
 * @param {*} oldProps
 * @param {*} newProps
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (let key in newProps) {
    //属性中的children属性不在此处理
    if (key === "children") {
      continue;
    } else if (key === "style") {
      let styleObj = newProps[key];
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (/^on[A-Z].*/.test(key)) {
      // dom[key.toLowerCase()] = newProps[key]
      addEvent(dom, key.toLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps;
    }
  }
  //如果属性在老的属性里，新的属性没有，需要从真实DOM中删除
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}

/**
 * dom diff 对比
 * @param {*} parentDom
 * @param {*} oldVdom
 * @param {*} newVdom
 */
export function compareTwoVdom(parentDom, oldVdom, newVdom, nextVdom) {
  if (!oldVdom && !newVdom) {
    return;
    //如果老节点存在 新节点不存在，需要直接删除老节点就可以了
  } else if (oldVdom && !newVdom) {
    unMountVdom(oldVdom);
  } else if (!oldVdom && newVdom) {
    let newDOM = createDOM(newVdom);

    parentDom.insertBefore(newDOM, findDom(nextVdom));
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    unMountVdom(oldVdom);
    let newDOM = createDOM(newVdom);

    parentDom.insertBefore(newDOM, findDom(nextVdom));
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
  } else {
    //如果老节点有值，并且新节点有值，并且类型相同
    updateElement(oldVdom, newVdom);
  }
}
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === REACT_TEXT) {
    let currentDOM = (newVdom.dom = findDom(oldVdom));
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props;
    }
  } else if (typeof oldVdom.type === "string") {
    let currentDOM = (newVdom.dom = findDom(oldVdom));
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  }else if(oldVdom.type===REACT_FRAGMENT){
    updateFragment(oldVdom, newVdom)
  } else if (typeof oldVdom.type === "function") {
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}
function updateFragment(oldVdom, newVdom) {
  let currentDOM = newVdom.dom =findDom(oldVdom)
  updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
}
function updateClassComponent(oldVdom, newVdom) {
  const classInstance = (newVdom.classInstance = oldVdom.classInstance);
  if (classInstance.UNSAFE_componentWillReceiveProps) {
    classInstance.UNSAFE_componentWillReceiveProps();
  }
  classInstance.updater.emitUpdate(newVdom.props);
}

function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDom(oldVdom);
  if (!currentDOM) return;

  let { type, props } = newVdom;
  let newRenderVdom = type(props);
  compareTwoVdom(currentDOM.parentNode, oldVdom.renderVdom, newRenderVdom);
  newRenderVdom.oldRenderVdom = newRenderVdom;
}

function updateChildren(parentDOM, oldVChilcren, newVChildren) {
  // debugger
  oldVChilcren = Array.isArray(oldVChilcren) ? oldVChilcren : [oldVChilcren];
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren];

  // 1.构建一个map
  const keyedOldMap= {}
  let lastPlacedIndex = 0
  oldVChilcren.forEach((oldVChild,index) => {
    let oldkey = oldVChild.key ? oldVChild.key : index
    keyedOldMap[oldkey] = oldVChild
  });

  //创建爱你一个dom补丁包 收集dom操作
  let patch = []
  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index
    const newKey = newVChild.key? newVChild.key:index
    let oldVChild = keyedOldMap[newKey]
    if (oldVChild) {
      updateElement(oldVChild, newVChild)
      if (oldVChild.mountIndex < lastPlacedIndex) {
        patch.push({
          type:MOVE,
          oldVChild,
          newVChild,
          mountIndex:index
        })
      }
      //如果一个老节点复用了就从map中删除
      delete keyedOldMap[newKey]
      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex)
    }else{
      patch.push({
        type:PLACEMENT,
        newVChild,
        mountIndex: index
      })
    }
  })
  //过滤出补丁包里需要移动的老节点
  let moveVChildren = patch.filter(action => action.type === MOVE).map(action => action.oldVChild)
  //先把那些要移动的和要删除节点先全部删除
  Object.values(keyedOldMap).concat(moveVChildren).forEach(oldVChild => {
    let currentDOM = findDom(oldVChild)
    currentDOM.remove()
  })
  patch.forEach(action => {
    let {type, oldVChild, newVChild, mountIndex} = action
    //老的真实DOM节点集合
    let childNodes = parentDOM.childNodes
    if (type === PLACEMENT) {
      let newDOM = createDOM(newVChild)
      let childNode = childNodes[mountIndex]
      parentDOM.insertBefore(newDOM ,childNode)

    }else if (type === MOVE) {
      let oldDOM = findDom(oldVChild)
      let childNode = childNodes[mountIndex]
      parentDOM.insertBefore(oldDOM ,childNode)
    }
  })

  // const maxLen = Math.max(oldVChilcren.length, newVChildren.length);
  // for (let i = 0; i < maxLen; i++) {
  //   let nextVdom = oldVChilcren.find(
  //     (item, index) => index > i && item && findDom(item)
  //   );
  //   compareTwoVdom(parentDOM, oldVChilcren[i], newVChildren[i], nextVdom);
  // }
}

/**
 * 卸载老的节点
 * @param {*} vdom
 */
function unMountVdom(vdom) {
  let { type, props, ref, classInstance } = vdom;
  let currentDOM = findDom(vdom);
  if (classInstance && classInstance.componentWillUnmount) {
    classInstance.componentWillUnmount();
  }
  if (ref) {
    ref.current = null;
  }

  if (props.children) {
    let children = (
      Array.isArray(props.children) ? props.children : [props.children]
    ).filter((item) => typeof item !== "undefined" && item !== null);
    children.forEach(unMountVdom);
  }
  if (currentDOM) currentDOM.remove();
}

export function findDom(vdom) {
  if (!vdom) return vdom;

  //如果有dom说明是原生标签 span div
  if (vdom.dom) {
    return vdom.dom;
  } else {
    let oldRenderVdom;
    if (vdom.classInstance) {
      oldRenderVdom = vdom.classInstance.oldRenderVdom;
    } else {
      oldRenderVdom = vdom.oldRenderVdom;
    }
    return findDom(oldRenderVdom);
  }
}

const ReactDOM = {
  render,
};

export default ReactDOM;
