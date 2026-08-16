/**
 * Replaces AdminLTE's JS for the app shell (2026-08 "neue Optik" pass).
 * AdminLTE provided two shell behaviors via `data-widget="..."` attributes:
 *   - pushmenu: collapse/expand the sidebar
 *   - treeview: expand/collapse nested submenus
 * This markup has no nested submenus (checked: every sidebar `<li>`, static
 * and the ones templates.js generates per page, is flat) so treeview is a
 * no-op here and isn't reimplemented - only pushmenu is real. Kept the same
 * `data-widget="pushmenu"` attribute name on the markup so this is a
 * drop-in behavioral replacement, not a markup change.
 */
import $ from './jquery-global.js';

export function initShell () {
  $ ('[data-widget="pushmenu"]').on ('click', function (e) {
    e.preventDefault ();
    $ ('body').toggleClass ('sidebar-collapse');
  });
}
