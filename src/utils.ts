export function newElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text: string,
  parent: HTMLElement | undefined = undefined,
  classes: string[] = [],
  attributes: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.textContent = text;
  if (classes.length > 0) {
    element.classList.add(...classes);
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'type' && tag === 'input') {
      element.setAttribute('type', value);
    } else if (key === 'readonly' && value === 'true' && tag === 'input') {
      element.setAttribute('readonly', '');
    } else {
      element.setAttribute(key, value);
    }
  }
  if (parent !== undefined) {
    parent.append(element);
  }
  return element;
}
