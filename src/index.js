import React from './react';
// import React from 'react';
// import ReactDOM from 'react-dom';
import ReactDOM from './react-dom';
let element =  <div>hello<h1 className='title' style={{color:'red'}}>React</h1></div>
console.log(element);
ReactDOM.render(
  element
  ,document.getElementById('root')
);


