export const BIM_TEST_VERSIONS = {
  "@thatopen/components": "3.4.8",
  "@thatopen/components-front": "3.4.4",
  "@thatopen/fragments": "3.4.7",
  "web-ifc": "0.0.77",
  three: "0.182.0",
  "camera-controls": "3.1.2",
} as const;

/** Self-hosted web-ifc WASM directory (trailing slash required by web-ifc). */
export const WEB_IFC_WASM_PATH = "/bim-test/wasm/";

/** Self-hosted fragments worker matching @thatopen/fragments@3.4.7. */
export const FRAGMENTS_WORKER_URL = "/bim-test/worker/worker.mjs";

/**
 * Public sample IFC used only as a documented demo URL.
 * Source: That Open engine_components tutorial resources (school structure).
 * Conversion still happens in the browser; the file is never uploaded to this server.
 */
export const PUBLIC_SAMPLE_IFC_URL =
  "https://thatopen.github.io/engine_components/resources/ifc/school_str.ifc";

export const PUBLIC_SAMPLE_IFC_LABEL = "school_str.ifc (That Open public sample)";

export const INDEXED_DB_NAME = "pgc-bim-test";
export const INDEXED_DB_STORE = "fragments";
export const INDEXED_DB_VERSION = 1;
