/*
 * returns difference between two numbers in %
 * @param {a} 1 number
 * @param {b} 2 number
 */

export function relDiff(a, b) {
  return 100 * Math.abs((a - b) / ((a + b) / 2));
}

/*
 * returns formatted number
 * @param {x} number
 */

export function numberWithCommas(x) {
  if (typeof x !== "undefined") {
    return x.toLocaleString();
  } else {
    return "";
  }
}
