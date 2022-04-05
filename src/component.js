import { ReactComponent} from './constants'
import {compareTwoVdom, findDom} from './react-dom'
class Updater{
    constructor(classInstance){
        //类组件的实例
        this.classInstance = classInstance
        //等待更新的状态
        this.pendingStates = []
        //更新后的会调
        this.callbacks = []
    }

    addState(partialState, callback){
         this.pendingStates.push(partialState)
         if (typeof callback === 'function') {
            this.callbacks.push(callback)
         }
         this.emitUpdate()
    }

    emitUpdate(){
        this.updateComponent()
    }
    updateComponent(){
        let {pendingStates, classInstance, callbacks } = this

        //长度大于零 说明当前正在准备要更新的状态
        if (pendingStates.length > 0) {
            shouldUpdate(classInstance, this.getState())
        }
        if (callbacks.length > 0) {
            callbacks.forEach(callback => callback())
            callbacks.length = 0
        }
    }

    getState(){
        let {pendingStates, classInstance } = this
        //先获取老状态
        let {state} = classInstance

        //用老状态合并新状态
        pendingStates.forEach((partialState) => {
            if (typeof partialState === 'function') {
                partialState = partialState(state)
            }
                state = {...state, ...partialState}
            
        })
        pendingStates.length = 0

        return state
    }
}

/**
 * 
 * @param {*} classInstance  类组件的实例
 * @param {*} nextState 新状态
 */
function shouldUpdate(classInstance, nextState) {
    classInstance.state = nextState
    classInstance.forceUpdate()
}

export class Component{

    static isReactComponent = ReactComponent

    constructor(props){ 
        this.props = props
        this.state = {}
        this.updater = new Updater(this)
    }

    setState(partialState, callback){
        this.updater.addState(partialState, callback)
    }

    //让类组件强行更新
    forceUpdate(){
        //获取此组件上次渲染出来的vdom
        let oldRenderVdom = this.oldRenderVdom

        //获取vdom对应的真实DOM oldRenderVdom.dom
        let oldDom = findDom(oldRenderVdom)

        //重新执行render 得到新的虚拟Dom
        let newRenderVdom = this.render()

        //把老的vdom和新的vdom进行对比，把对比得到的差异更新到真实的DOm
        compareTwoVdom(oldDom.parentNode, oldRenderVdom, newRenderVdom)
        this.oldRenderVdom = newRenderVdom
    }
}