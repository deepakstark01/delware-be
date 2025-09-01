export const pick = (obj, keys) => {
  return keys.reduce((picked, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      picked[key] = obj[key];
    }
    return picked;
  }, {});
};
