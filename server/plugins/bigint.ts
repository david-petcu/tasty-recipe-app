export default defineNitroPlugin(() => {
  BigInt.prototype.toJSON = function () { return Number(this) }
})