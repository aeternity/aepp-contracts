// @ts-ignore:  Property 'toJSON' does not exist on type 'BigInt'.
BigInt.prototype.toJSON = function () {
  return +this.toString();
};

Uint8Array.prototype.toString = function () {
  return Buffer.from(this).toString("hex");
};

// @ts-ignore:  Property 'toJSON' does not exist on type 'Uint8Array'.
Uint8Array.prototype.toJSON = function () {
  return this.toString();
};

// @ts-ignore:  Property 'toJSON' does not exist on type 'Map'.
Map.prototype.toJSON = function () {
  return Object.fromEntries(this);
};
