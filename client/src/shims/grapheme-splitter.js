// client/src/shims/grapheme-splitter.js
// Shim for grapheme-splitter to provide default export
import * as GraphemeSplitter from "grapheme-splitter";

const DefaultExport = GraphemeSplitter && (GraphemeSplitter.default || GraphemeSplitter.GraphemeSplitter || GraphemeSplitter);

export default DefaultExport;
export * from "grapheme-splitter";
