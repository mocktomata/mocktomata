
export function isInRange(start: number, end: number) {
  return Object.assign(
    a => a >= start && a <= end,
    {
      toString() {
        return `[${start}...${end}]`
      }
    })
}
