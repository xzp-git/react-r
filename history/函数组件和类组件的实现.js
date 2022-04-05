import React from './react';
import ReactDOM from './react-dom';
// import React from 'react';
// import ReactDOM from 'react-dom';


function FunctionComponent(props) {
  let renderVdom = <h1 className="title" style={{ color: 'red', backgroundColor: 'green' }}>
    {props.msg} < span > world</span >
  </h1 >
  return renderVdom;
}

class ClassComponent extends React.Component {
  render() {
    let renderVdom = <h1 className="title" style={{ color: 'red', backgroundColor: 'green' }}>
      {this.props.msg} < span > worldwwwwwwwwwwwwwwwww</span >
    </h1 >
    return renderVdom;
  }
}
// let element =  <div>hello<h1 className='title' style={{color:'red'}}>React</h1></div>
let element = <ClassComponent msg="消息" age={12} />; 

console.log(element);
ReactDOM.render(
  element
  ,document.getElementById('root')
);


