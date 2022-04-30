import { ReactComponent } from "./constants";
import { compareTwoVdom, findDom } from "./react-dom";

export const updateQueue = {
  isBatchingUpdate: false,
  updaters: new Set(),
  batchUpdate() {
    //批量更新的方法
    updateQueue.isBatchingUpdate = false;
    for (const updater of updateQueue.updaters) {
      updater.updateComponent();
    }
    updateQueue.updaters.clear();
  },
};

class Updater {
  constructor(classInstance) {
    //类组件的实例
    this.classInstance = classInstance;
    //等待更新的状态
    this.pendingStates = [];
    //更新后的会调
    this.callbacks = [];
  }

  addState(partialState, callback) {
    this.pendingStates.push(partialState);
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    this.emitUpdate();
  }

  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    if (updateQueue.isBatchingUpdate) {
      //如果当前处于批量更新模式 只添加updater
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent();
    }
  }
  updateComponent() {
    let { pendingStates, classInstance, callbacks, nextProps, callback } = this;

    //长度大于零 说明当前正在准备要更新的状态
    //如果有新的属性，或者说有新的状态都会进行更新
    if (nextProps || pendingStates.length > 0) {
      let newState = this.getState();
      shouldUpdate(classInstance, nextProps, newState);
    }
    queueMicrotask(() => {
      if (callbacks.length > 0) {
        callbacks.forEach((callback) => callback());
        callbacks.length = 0;
      }
    });
  }

  getState() {
    let { pendingStates, classInstance } = this;
    //先获取老状态
    let { state } = classInstance;

    //用老状态合并新状态
    pendingStates.forEach((partialState) => {
      if (typeof partialState === "function") {
        partialState = partialState(state);
      }
      state = { ...state, ...partialState };
    });
    pendingStates.length = 0;

    return state;
  }
}

/**
 *
 * @param {*} classInstance  类组件的实例
 * @param {*} nextState 新状态
 */
function shouldUpdate(classInstance, nextProps, nextState) {
  //表示是否要更新
  let willUpdate = true;

  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate(classInstance.props, nextState)
  ) {
    //如果类组件有shouldComponentUpdate方法
    willUpdate = false;
  }

  if (willUpdate && classInstance.UNSAFE_componentWillUpdate) {
    classInstance.UNSAFE_componentWillUpdate();
  }

  if (nextProps) {
    classInstance.props = nextProps;
  }

  //不管要不要更新， 类的实例的state都会改变，都会指向新的状态
  classInstance.state = nextState;
  if (willUpdate) classInstance.forceUpdate();

  /* classInstance.state = nextState
    classInstance.forceUpdate() */
}

export class Component {
  static isReactComponent = ReactComponent;

  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }

  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }

  //让类组件强行更新
  forceUpdate() {
    //获取此组件上次渲染出来的vdom
    let oldRenderVdom = this.oldRenderVdom;

    //获取vdom对应的真实DOM oldRenderVdom.dom
    let oldDom = findDom(oldRenderVdom);

    //重新执行render 得到新的虚拟Dom
    let newRenderVdom = this.render();

    //把老的vdom和新的vdom进行对比，把对比得到的差异更新到真实的DOm
    compareTwoVdom(oldDom.parentNode, oldRenderVdom, newRenderVdom);
    this.oldRenderVdom = newRenderVdom;

    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state);
    }
  }
}
