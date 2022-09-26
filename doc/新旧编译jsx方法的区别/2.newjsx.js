const babel = require("@babel/core")

let sourceCode = `
    <h1>
        hello <span style={{color:"red"}}>world</span>
    </h1>
`
const result = babel.transform(sourceCode, {
    plugins:[
        [
            "@babel/plugin-transform-react-jsx", {runtime: 'automatic'}
        ]
    ]
})

console.log(result.code);

/**
 * 
 * 
  import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";


_jsxs("h1", {
    children: ["hello ", _jsx("span", {
      style: {
        color: "red"
      },
      children: "world"
    })]
  });
  
 * 
 */


/**
 * 
 * 区别 
 * 1. React.createElement 方法类似于 _jsxs _jsx方法
 * 2. React.createElement 方法中 children 是在第三个参数及以后
 *    而 _jsxs _jsx方法 中 children 被合并到了 第二个参数中
 */