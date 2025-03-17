export default function newElement(
  tag: string,
  text: string,
  parent: HTMLElement | undefined = undefined,
  classes: string[] = [],
  attributes: Record<string, string> = {},
): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = text;
  if (classes.length > 0) {
    element.classList.add(...classes);
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'type' && value === 'text' && tag === 'input') {
      element.setAttribute('type', value);
    } else if (key === 'type' && value === 'number' && tag === 'input') {
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
