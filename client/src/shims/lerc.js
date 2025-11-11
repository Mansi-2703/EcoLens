// client/src/shims/lerc.js
// Shim for lerc to provide default export
import * as Lerc from "lerc";

const DefaultExport = Lerc && (Lerc.default || Lerc.Lerc || Lerc);

export default DefaultExport;
export * from "lerc";
