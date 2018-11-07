export function getSizeToFillScreen(content, screen) {
  if ((screen.width / screen.height) > (content.width / content.height)) {
    return {
      width: screen.width,
      height: content.height * (screen.width / content.width)
    };
  } else {
    return {
      width: content.width * (screen.height / content.height),
      height: screen.height
    };
  }
};

export function numberWithCommas(number) {
  const parts = number.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${parts.join('.')}`;
}
