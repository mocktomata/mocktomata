export function isInOpenInterval(start: number, end: number) {
  return Object.assign(
    a => a > start && a < end,
    {
      toString() {
        return `(${start}...${end})`
      }
    })
}
export function isInClosedInterval(start: number, end: number) {
  return Object.assign(
    a => a >= start && a <= end,
    {
      toString() {
        return `[${start}...${end}]`
      }
    })
}

export function isInLeftClosedInterval(start: number, end: number) {
  return Object.assign(
    a => a >= start && a < end,
    {
      toString() {
        return `[${start}...${end})`
      }
    })
}

export function isInRightClosedInterval(start: number, end: number) {
  return Object.assign(
    a => a > start && a <= end,
    {
      toString() {
        return `(${start}...${end}]`
      }
    })
}
