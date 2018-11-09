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

// Basic lerp funtion.
export function lerp(a1, a2, t) {
  return a1 * (1 - t) + a2 * t;
}

// Backout function from tweenjs.
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
export function backout(amount) {
  return function(t) {
    return (--t * t * ((amount + 1) * t + amount) + 1);
  };
};

export function getTweening(object, property, target, time, easing, onchange, oncomplete) {
  const tween = {
    object: object,
    property: property,
    propertyBeginValue: object[property],
    target: target,
    easing: easing,
    time: time,
    change: onchange,
    complete: oncomplete,
    start: Date.now()
  };
  return tween;
}
