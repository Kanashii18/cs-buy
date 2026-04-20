// alertbox.js
let externalResolver = null;

export function openAlert(message, buttonText, color = 'Confirm') {
  return new Promise((resolve) => {
    externalResolver = resolve;
    const event = new CustomEvent('open-alert', { detail: { message, buttonText, color } });
    window.dispatchEvent(event);
  });
}

export function resolveAlert(value) {
  if (externalResolver) {
    externalResolver(value);
    externalResolver = null;
  }
}
