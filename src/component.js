import { ReactComponent} from './constants'

export class Component{

    static isReactComponent = ReactComponent

    constructor(props){ 
        this.props = props
    }
}