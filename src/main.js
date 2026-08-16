/**
 * App entry point (was dist/js/app.js, loaded via 25 separate <script>
 * tags; now the single Vite/ESM entry - 2026-08 migration). Responsible
 * for: pulling in every 3rd-party dependency (npm packages replacing the
 * old vendored plugins/ + dist/js|css copies - see the import list below
 * for exactly what replaced what), wiring the top-level UI (nav-section
 * switching, connect/save/load buttons, import/export, preview), and the
 * homemade `workingBuffer` async job queue (kept as-is; replacing it with
 * real async/await is explicitly out of scope for this migration).
 *
 * jQuery needs to be a real `window.$`/`window.jQuery` global (not just a
 * module-scoped import) because inline onclick="..."/onchange="..." HTML
 * attribute handlers throughout the generated widget/page markup call
 * bare `$(...)` - see the window-exposure comments in helper_fkt.js /
 * widget_fkt.js for the equivalent reasoning applied to our own functions.
 */
// Must stay the first import - see jquery-global.js for why.
import $ from './js/jquery-global.js';
// The old dist/css/adminlte.min.css bundled a full compiled copy of
// Bootstrap 4's CSS internally (common for admin themes) - there was never
// a standalone Bootstrap stylesheet link in this app. Deleting AdminLTE
// during the shell redesign silently deleted Bootstrap's base CSS with it
// (modals, navbar, forms, grid, buttons, ...) - `import 'bootstrap'` below
// only pulls in Bootstrap's JS bundle, never its CSS. Restoring it explicitly.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-table';
import 'bootstrap-table/dist/bootstrap-table.min.css';
import 'bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'corejs-typeahead';
import 'fontawesome-iconpicker';
import 'fontawesome-iconpicker/dist/css/fontawesome-iconpicker.min.css';
import 'gridstack/dist/gridstack.min.css';
import numeral from 'numeral';

import './css/shell.css';
import './css/app.css';

import { state } from './js/state.js';
import { getTemplates } from './js/templates.js';
import { getDefaultLightTheme, getDefaultDarkTheme } from './js/themes.js';
import { initShell } from './js/shell.js';
import {
  connect_socket,
  generateConfig,
  importConfig,
  init_modal,
  init_statesTypeahead,
  showPreviewQrCode,
  clearBrowserCache,
  addWorkingNote,
  removeWorkingNote,
  readConfigFromFile,
  deleteConfigFile,
  sanitize,
} from './js/helper_fkt.js';
import { addPage, generatePages, initBannerData, ensureStartpage } from './js/page_fkt.js';
import { UUID } from './vendor/uuid-v4.js';

numeral.locale ('de');

/**
 * Homemade async job queue: every multi-step operation (save, import,
 * page-copy, page-order, ...) pushes {addWorkingNote, <work>,
 * removeWorkingNote} onto state.workingBuffer; this poller drains one job
 * per tick. Preserved unchanged - see plan notes for why replacing it with
 * real async/await is deferred to a future phase.
 *
 * Was a bare (no var/let/const) global function expression - forced fix,
 * not optional cleanup: ES module strict mode throws ReferenceError on
 * implicit globals immediately, so this had to become a real declaration
 * to run at all.
 */
export function workWithBuffer () {
  if (state.workBufferWorking === false && state.workBufferWorkingEdge === true) {
    state.workingBuffer.splice (0, 1); // remove job
    state.workBufferWorkingEdge = state.workBufferWorking;
  }
  if (state.workingBuffer.length === 0 || state.workBufferWorking === true) {
    return;
  }

  console.log (state.workingBuffer.length);
  state.workBufferWorking = true;
  state.workBufferWorkingEdge = state.workBufferWorking;

  let retVal = state.workingBuffer[0].jobfunction (state.workingBuffer[0].args); // (was implicit global)
}

function init () {
  console.log ('App init');
  initShell ();
  // check if develpoment mode
  if (window.location.host.indexOf ('dev') == 0) {
    $ ('body').addClass ('is-development');
    $ ('body').prepend (state.templates.devNote);
    state.version = state.version + '-dev';
    state.isDevelopment = true;
  }
  // version
  $ ('#versionnumber').text ('Version ' + state.version);

  if (state.isDevelopment === false) {
    // assume same url and port
    $ ('#data-url-port').val (
      window.location.protocol + '//' + window.location.host
    );
  }

  $ ('#togglePassword').on ('click', function (e) {
    e.preventDefault ();
    // toggle the type attribute
    const type = $ ('#password').attr ('type') === 'password'
      ? 'text'
      : 'password';
    $ ('#password').attr ('type', type);
    // toggle the eye icon
    $ ('#togglePassword i').toggleClass ('fa-eye');
    $ ('#togglePassword i').toggleClass ('fa-eye-slash');
  });

  $ ('.nav-item a.menu-link-page').on ('click', function (e) {
    e.preventDefault ();
    $ ('#css').hide ();
    $ ('#theme').hide ();
    $ ('#bannerData').hide ();
    $ ('.page').hide ();
    $ ('#imExportSection').hide ();
    $ ($ (this).attr ('href')).show ();
    //console.log($(this).attr("href"));
  });

  $ ('#css-nav-item a').on ('click', function (e) {
    e.preventDefault ();
    $ ('.sidebar-settings-table').hide ();
    $ ('.widget-settings-table').hide ();
    $ ('.page').hide ();
    $ ('#theme').hide ();
    $ ('#bannerData').hide ();
    $ ('#imExportSection').hide ();
    $ ('#css').show ();
  });

  $ ('#theme-nav-item a').on ('click', function (e) {
    e.preventDefault ();
    $ ('.sidebar-settings-table').hide ();
    $ ('.widget-settings-table').hide ();
    $ ('.page').hide ();
    $ ('#css').hide ();
    $ ('#bannerData').hide ();
    $ ('#imExportSection').hide ();
    $ ('#theme').show ();
  });

  $ ('#banner-nav-item a').on ('click', function (e) {
    e.preventDefault ();
    $ ('.sidebar-settings-table').hide ();
    $ ('.widget-settings-table').hide ();
    $ ('.page').hide ();
    $ ('#css').hide ();
    $ ('#theme').hide ();
    $ ('#imExportSection').hide ();
    $ ('#bannerData').show ();
  });

  $ ('#btn-theme-light').on ('click', function (e) {
    e.preventDefault ();
    $ ('#theme textarea').val ();
    $ ('#theme textarea').val (getDefaultLightTheme ());
  });

  $ ('#btn-theme-dark').on ('click', function (e) {
    e.preventDefault ();
    $ ('#theme textarea').val ();
    $ ('#theme textarea').val (getDefaultDarkTheme ());
  });

  $ ('#chkAuth').change (function () {
    if (this.checked != true) {
      $ ('#credentialswrapper').hide ();
    } else {
      $ ('#credentialswrapper').show ();
    }
  });

  $ (document).ready (function () {
    // init banner section
    initBannerData ();
    // init buttons
    $ ('#btn-ul-config').click (function () {
      $ ('#upload-config-file').click ();
    });
    $ ('#btn-add-page').click (function () {
      //console.log("Handler for add Page called.");
      $ ('#css').hide ();
      $ ('#theme').hide ();
      $ ('#bannerData').hide ();
      $ ('#imExportSection').hide ();
      var pageUUID = addPage ();
      $ ('#' + pageUUID).addClass ('rendered');
    });
    $ ('#btn-connect').click (function (event) {
      connect_socket ();
    });
    $ ('#btn-read-variables').attr ('disabled', 'disabled');
    $ ('#btn-read-configfiles').attr ('disabled', 'disabled');

    $ ('#select-configfile').on ('keyup', function () {
      //console.log(this.value);
      $ ('#select-configfile').val (sanitize (this.value));
    });
    $ ('#select-configfile').on ('click', function () {
      //console.log(this.value);
      this.select ();
    });

    $ ('#credentialswrapper').hide ();

    $ ('#btn-save-file').on ('click', function (event) {
      event.preventDefault ();
      console.log ('Save config in file');
      // show loading
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: addWorkingNote,
        args: 'save config to file',
      });
      //addPage();
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: generateConfig,
        args: true,
      });
      // hide loading
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: removeWorkingNote,
        args: null,
      });
      //generateConfig();
    });

    $ ('#btn-load-file').on ('click', function (event) {
      event.preventDefault ();
      console.log ('load config from file');
      readConfigFromFile ($ ('#select-configfile').val () + '.json');
    });

    $ ('#btn-delete-file').on ('click', function (event) {
      event.preventDefault ();
      console.log ('delete config-file');
      deleteConfigFile ($ ('#select-configfile').val () + '.json');
    });

    $ ('#btn-cache-clear-all').on ('click', function (event) {
      event.preventDefault ();
      let clearCacheConfirmation = confirm (
        'This will delete all your not saved configuration !\n\nis this ok ?'
      );
      if (clearCacheConfirmation === true) {
        console.log ('confirmed clear browser cache');
        clearBrowserCache ();
      }
    });

    // not working at the moment
    //init_download();

    // try to read variables
    // variables = JSON.parse(localStorage.getItem("variables") || null);
    // arrStates = JSON.parse(localStorage.getItem("arrStates") || null);
    init_statesTypeahead ();
    // init-iconpicker
    $ ('.icp').iconpicker ();
    // init modal
    init_modal ();

    $ ('#preview-nav-item').click (function (event) {
      event.preventDefault ();
      let appConfig = generateConfig ();
      const url = encodeURIComponent (appConfig.dataprovider.url);
      const file = encodeURIComponent (appConfig.dataprovider.fileName);
      let auth = "";
      //console.warn ($ ('#chkAuth')[0].checked);
      if ($ ('#chkAuth')[0].checked) {
        auth = "&auth";
      }
      const preViewURL =
        '/' + state.appPath + '?url=' + url + '&file=' + file + '&forceUpdate' + auth;

      showPreviewQrCode (
        window.location.protocol + '//' + window.location.host + preViewURL
      );

      window.open (preViewURL, '_blank');
    });

    $ ('#show-config-nav-item').click (function (event) {
      event.preventDefault ();
      generateConfig ();
      var outConfig = localStorage.getItem ('appConfig');
      $ ('#show-config-holder pre').html ();
      $ ('#show-config-holder pre').html (
        JSON.stringify (JSON.parse (outConfig), null, 2)
      );
      $ ('#configShowModal').modal ('show');
    });

    $ ('#only-show-config-nav-item').click (function (event) {
      event.preventDefault ();
      generateConfig (false);
      var outConfig = localStorage.getItem ('appConfig');
      $ ('#show-config-holder pre').html ();
      $ ('#show-config-holder pre').html (
        JSON.stringify (JSON.parse (outConfig), null, 2)
      );
      $ ('#configShowModal').modal ('show');
    });

    $ ('#imExport-config-nav-item').click (function (event) {
      event.preventDefault ();
      generateConfig (false);
      console.log ('read appconfig');
      var outConfig = localStorage.getItem ('appConfig');
      console.log ('show appconfig');
      console.log (outConfig);

      $ ('#imExportTextarea').val ('');
      $ ('#imExportTextarea').val (
        JSON.stringify (JSON.parse (outConfig), null, 2)
      );

      $ ('.sidebar-settings-table').hide ();
      $ ('.widget-settings-table').hide ();
      $ ('.page').hide ();
      $ ('#theme').hide ();
      $ ('#bannerData').hide ();
      $ ('#css').hide ();
      $ ('#imExportSection').show ();

      console.log ('show imExportTextarea');
    });

    $ ('.btn-importConfig').click (function (event) {
      event.preventDefault ();
      importConfig ($ ('#imExportTextarea').val (), 0, null);
    });

    $ ('#btn-importSettingsConfirm').click (function (event) {
      event.preventDefault ();
      let widgetWidth = parseInt (
        $ ('#importSettingsSelectRows input:radio:checked').val (),
        10
      );
      let theme = $ ('#importSettingsSelectTheme input:radio:checked').val ();
      importConfig ($ ('#imExportTextarea').val (), widgetWidth, theme);
    });

    // show loading
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: addWorkingNote,
      args: 'generate pages',
    });
    // if config then generate Pages
    //generatePages();
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: generatePages,
      args: state.numberOfCols,
    });
    // generatePages() rebuilds the page list from localStorage.appConfig
    // and wipes any existing DOM pages first - so "is there a page?" can
    // only be checked (and, if not, a default one created) after it runs.
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: ensureStartpage,
      args: null,
    });
    // hide loading
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: removeWorkingNote,
      args: null,
    });

    // start worker
    let wBInterval = setInterval (workWithBuffer, state.workBufferInterval); // (was implicit global)
  });

  // init mfd-Icon-Dropdown
  console.log ('Init MFD-Icons-Dropdown');
  //console.log(getMfdIcons());
  let icons = {};

  // getMfdIcons()/getMdiIcons()/getEmIcons() come from the plain
  // <script> tags in index.html (dist/js/mfdicons.js etc. - still legacy
  // global-scope data files, not converted to modules; see index.html
  // comments). Reading a window global from a module is always fine, only
  // *writing* implicit globals is the strict-mode problem this migration
  // had to fix elsewhere.
  let MfdIconList = getMfdIcons ();
  let MdiIconList = getMdiIcons ();
  let EmIconList = getEmIcons ();
  icons = MfdIconList.concat (MdiIconList);
  icons = icons.concat (EmIconList);

  // console.error("icons:");
  // console.error(icons);
  // console.error(Object.keys(icons).length);

  $ ('#icp-mfd').iconpicker ({
    title: 'Select Icon',
    //icons: getMfdIcons(),
    // icons: getMdiIcons(),
    icons: icons,
    selectedCustomClass: 'bg-secondary',
  });

  // Bind iconpicker events to the element
  $ ('#icp-mfd').on ('iconpickerSelected', function (event) {
    /* event.iconpickerValue */
    console.log ('#icp-mfd data: ' + event.iconpickerValue);
    $ ('#icp-mfd').attr ('data-iconvalue', event.iconpickerValue);
  });
}

state.templates = getTemplates ();

init ();
