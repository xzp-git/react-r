export function setValueForStyles(domElement, styles) {
  const { style } = domElement;

  for (const styleName in styles) {
    if (style.hasOwnProperty(styleName)) {
      const styleValue = styles[styleName];
      style[styleName] = styleValue;
    }
  }
}
