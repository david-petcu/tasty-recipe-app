declare global {
  interface BigInt {
    toJSON(): number
  }
}

export default defineNitroPlugin(() => {
  BigInt.prototype.toJSON = function () { return Number(this) }
})
