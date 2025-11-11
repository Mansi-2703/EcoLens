// client/src/shims/nosleep.js
// Shim for nosleep.js to provide default export
import * as NoSleep from "nosleep.js";

const DefaultExport = NoSleep && (NoSleep.default || NoSleep.NoSleep || NoSleep);

export default DefaultExport;
export * from "nosleep.js";
