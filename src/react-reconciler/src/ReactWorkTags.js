// 根 Fiber 的tag
// 每种虚拟DOM都会对应自己的fiber tag类型

export const FunctionComponent = 0;
export const ClassComponent = 1;
export const IndeterminateComponent = 2;
export const HostRoot = 3;

export const HostComponent = 5;

export const HostText = 6;
