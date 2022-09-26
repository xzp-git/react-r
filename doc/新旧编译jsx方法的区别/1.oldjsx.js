const babel = require("@babel/core")

let sourceCode = `
    <h1>
        hello <span style={{color:"red"}}>world</span>
    </h1>
`
const result = babel.transform(sourceCode, {
    plugins:[
        [
            "@babel/plugin-transform-react-jsx", {runtime: 'classic'}
        ]
    ]
})

console.log(result.code);

/**
 * 
 * 
  React.createElement("h1", null, "hello ",React.createElement("span", {
    style: {
      color: "red"
    }
  }, "world"));
 * 
 */