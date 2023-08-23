import { createRoot } from "react-dom/client";

function FunctionComponent() {
  return (
    <h1
      id="h2222"
      onClick={() => {
        console.log("父React冒泡");
      }}
      onClickCapture={() => {
        console.log("父React捕获");
      }}
    >
      hello{" "}
      <span
        onClick={() => {
          console.log("子React冒泡");
        }}
        onClickCapture={() => {
          console.log("子React捕获");
        }}
        style={{ color: "red" }}
      >
        world
      </span>
    </h1>
  );
}

let element = <FunctionComponent />;
const root = createRoot(document.getElementById("root"));

root.render(element);
//document原生捕获 父R捕获 子R捕获 父原捕获 子原捕获 子原冒泡 父原冒泡 子R冒泡  父R冒泡 document原生冒泡
