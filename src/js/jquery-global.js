/**
 * Must be the very first import in main.js. jQuery-plugin packages
 * (bootstrap-table, bootstrap-select, corejs-typeahead,
 * fontawesome-iconpicker, ...) are UMD modules that check for a real
 * `window.jQuery` global at their OWN module-evaluation time - not via an
 * ESM import of jquery. ES module `import` statements always run before
 * any other top-level code in the importing file, regardless of source
 * order, so setting `window.jQuery` as a plain statement further down in
 * main.js (after the plugin imports) is too late - the plugins already
 * evaluated by then and threw "jQuery is not defined". Isolating the
 * assignment in its own module and importing *that* first forces the
 * right order.
 */
import $ from 'jquery';

window.$ = window.jQuery = $;

export default $;
