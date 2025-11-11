// client/src/shims/urijs.js
// Shim for urijs to provide default export
import * as URI from "urijs";

const DefaultExport = URI && (URI.default || URI.URI || URI);

export default DefaultExport;
export * from "urijs";
