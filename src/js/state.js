/**
 * Shared mutable application state.
 *
 * WHY THIS FILE EXISTS: the original app.js declared ~20 bare top-level
 * `var`s (socket, arrStates, grids, workingBuffer, ...) that every other
 * script file read/wrote directly, relying on classic <script>-tag global
 * scope. ES modules don't share scope that way - a `let`/`var` at the top
 * of one module is private to that module. This object is the explicit
 * replacement: every module imports `{ state }` and reads/writes `state.x`
 * instead of a bare global. It is a plain mutable object, not a reactive
 * store - no subscriptions, no re-render triggering, nothing framework-y.
 * That's deliberate: introducing real state management is out of scope for
 * this migration (see README changelog / migration notes for what was
 * intentionally deferred).
 */
export const state = {
  /** App version shown in the UI footer / used for the config export. */
  version: '3.0.0',

  /** Number of GridStack grid columns the page layout uses. */
  numberOfCols: 18,

  /** Relative path to the locally-built minuvis-webapp preview copy. */
  appPath: 'minuvis/app/',

  /** Raw ioBroker state objects as read from `getObjects`. */
  variables: [],

  /** Same data as `variables`, indexed by object id for O(1) lookup. */
  variablesAsObj: [],

  /** Flat list of usable state ids, used to feed the typeahead search. */
  arrStates: [],

  /** Active socket.io connection to the ioBroker adapter, or null. */
  socket: null,

  showInfoText: false,

  /** Subfolder under the meta datapoint where config JSON files live. */
  filePath: 'minukodu',

  /** ioBroker meta datapoint config files are stored under (fixed contract). */
  metaInfoSocketIO: '0_userdata.0',

  defaultIconFamily: 'mfd-icon',

  /** One GridStack instance per page. */
  grids: [],

  /** Widget data currently held by the copy/paste clipboard. */
  copiedWidgetdata: {},

  /**
   * Homemade async job queue (see workWithBuffer() in app.js/main.js).
   * Preserved as-is by design - replacing it with real async/await is
   * explicitly deferred, not part of this migration.
   */
  workingBuffer: [],
  workBufferWorking: false,
  workBufferWorkingEdge: false,
  workBufferInterval: 1000,

  /** Populated by getTemplates() during init(). */
  templates: null,

  isDevelopment: false,
};
