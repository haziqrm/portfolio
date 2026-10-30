/**
 * An element's layout box in viewport px, ignoring every CSS transform on it and its ancestors
 * (unlike getBoundingClientRect). Used to measure blocks while they, or the page around them,
 * are mid-animation.
 */
export function layoutRect(el: HTMLElement) {
  let left = 0;
  let top = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  left -= window.scrollX;
  top -= window.scrollY;
  return { left, top, width, height, cx: left + width / 2, cy: top + height / 2 };
}
