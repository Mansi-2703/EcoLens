// client/src/shims/bitmap-sdf.js
// Shim for bitmap-sdf to provide default export
import * as BitmapSDF from "bitmap-sdf";

const DefaultExport = BitmapSDF && (BitmapSDF.default || BitmapSDF.BitmapSDF || BitmapSDF);

export default DefaultExport;
export * from "bitmap-sdf";
