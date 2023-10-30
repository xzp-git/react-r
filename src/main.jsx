import { createRoot } from "react-dom/client";
import * as React from "react";

function reducer(state, action) {
  if (action.type === "add") {
    return state + action.payload;
  }
  return state;
}

// function FunctionComponent() {
//   const [number, setNumber] = React.useReducer(reducer, 0);
//   return (
//     <h1
//       id="h2222"
//       onClick={() => {
//         console.log("父React冒泡");
//       }}
//       onClickCapture={() => {
//         console.log("父React捕获");
//       }}
//     >
//       <span
//         onClick={() => {
//           console.log("子React冒泡");
//         }}
//         onClickCapture={() => {
//           console.log("子React捕获");
//         }}
//         style={{ color: "red" }}
//       >
//         world
//       </span>
//     </h1>
//   );
// }
function FunctionComponent() {
  const [number, setNumber] = React.useReducer(reducer, 0);
  let attrs = { id: "btn1" };
  if (number === 6) {
    delete attrs.id;
    attrs.style = { color: "red" };
  }
  return (
    <button
      {...attrs}
      onClick={() => {
        setNumber({ type: "add", payload: 1 });
        setNumber({ type: "add", payload: 2 });
        setNumber({ type: "add", payload: 3 });
      }}
    >
      {number}
    </button>
  );
}
let element = <FunctionComponent />;
const root = createRoot(document.getElementById("root"));

root.render(element);
//document原生捕获 父R捕获 子R捕获 父原捕获 子原捕获 子原冒泡 父原冒泡 子R冒泡  父R冒泡 document原生冒泡
