/**
 * Functional core of the builder: config generation/import, the socket.io
 * connection to ioBroker, config file I/O, modal handling, and assorted
 * utilities. Converted from a <script>-tag global-scope file to an ES
 * module (2026-08 migration) - logic is unchanged, only three kinds of
 * things changed:
 *  1. library access via npm imports instead of vendored <script> globals
 *  2. shared app state via the `state` object (./state.js) instead of
 *     bare top-level `var`s that used to live in app.js
 *  3. several variables that were accidentally implicit globals (no
 *     var/let/const - legal under old non-strict <script> tags, but a
 *     hard ReferenceError under ES module strict mode) now have explicit
 *     declarations. These are marked "(was implicit global)" inline.
 *
 * generateConfig()/importConfig() produce/consume the exact JSON shape
 * minuvis-webapp expects - do not change that shape here. Likewise
 * connect_socket()/readConfigFiles()/readConfigFromFile()/deleteConfigFile()
 * speak a fixed ioBroker socket.io RPC vocabulary (readFile/writeFile/
 * unlink/readDir/getObjects against meta datapoint state.metaInfoSocketIO) -
 * that's a hard external contract, not something to "clean up".
 */
import $ from 'jquery';
import moment from 'moment';
import Sortable from 'sortablejs';
import qrcode from 'qrcode-generator';
import io from 'socket.io-client';
import { state } from './state.js';
import { UUID } from '../vendor/uuid-v4.js';
import { CSSJSON } from '../vendor/cssjson.js';
import { getDefaultLightTheme, getDefaultDarkTheme } from './themes.js';
import { generatePages, getPageDatafromLocalStorage, sortPages } from './page_fkt.js';

export function importConfig (data = null, widgetWidth = 0, theme = 'dark') {
  try {
    //////////////////////////////////////////////////////////////////////////
    var newConfig = JSON.parse (data);
    // reset all UUIDs
    setAllByKey (newConfig, 'UUID', null);
    // console.log(newConfig);
    // generate pages
    console.log ('import from version: ' + parseInt (newConfig.version, 10));
    if (newConfig.version && parseInt (newConfig.version, 10) > 1) {
      // save in localstorage
      localStorage.setItem ('appConfig', JSON.stringify (newConfig));
      // show loading
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: addWorkingNote,
        args: 'generate pages with import-data',
      });
      //generatePages();
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: generateImportPages,
        args: null,
      });
      // hide loading
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: removeWorkingNote,
        args: null,
      });
    } else {
      if (state.socket) {
        // import V1-Config-data
        console.log ('import older version');
        if (widgetWidth < 9) {
          $ ('#imExport-config-holder textarea').val (data);
          $ ('#importSettingsModal').modal ('show');
          return;
        }
        // backup old config
        backupConfig (state.socket, data);
        // select theme
        let headLineTextColor = '#ffffff'; // default white
        if (theme === 'light') {
          newConfig.theme = CSSJSON.toJSON (getDefaultLightTheme ());
          headLineTextColor = '#1f1f21';
        } else {
          newConfig.theme = CSSJSON.toJSON (getDefaultDarkTheme ());
        }

        // get states
        let statesForImport = JSON.parse (JSON.stringify (state.arrStates)); // (was implicit global)

        // convert compactMode => Card
        var newConfigString = JSON.stringify (newConfig);
        newConfigString = newConfigString.replaceAll (
          '{"UUID":null,"type":"compactModeStart"',
          '{"UUID":null,"type":"card","widgets":[{"UUID":null,"type":"filler","cardtitle":true'
        );
        newConfigString = newConfigString.replaceAll (
          ',{"UUID":null,"type":"compactModeEnd"}',
          ']}'
        );
        newConfig = JSON.parse (newConfigString);
        console.log ('converted compactMode => card');
        console.log (newConfig);

        let importWidgetWidth = widgetWidth; // (was implicit global)
        let importWidgetHeight = 1; // (was implicit global)
        console.log ('importWidgetWidth: ' + importWidgetWidth);

        for (var pageId in newConfig.pages) {
          for (var widgetId in newConfig.pages[pageId].widgets) {
            // adding stateId-Typ
            for (var key in statesForImport) {
              if (
                statesForImport[key]._id ==
                newConfig.pages[pageId].widgets[widgetId].stateId
              ) {
                newConfig.pages[pageId].widgets[widgetId].stateIdType =
                  statesForImport[key].common.type;
                break;
              }
            }
            newConfig.pages[pageId].widgets[
              widgetId
            ].widgetWidth = importWidgetWidth;
            newConfig.pages[pageId].widgets[
              widgetId
            ].widgetHeight = importWidgetHeight;
            newConfig.pages[pageId].widgets[widgetId].imported = true;
          }
          newConfig.pages[pageId].headLineTextColor = headLineTextColor;
        }
        // reset banner
        newConfig.banner = {};
        newConfig.banner.useBanner = false;
        newConfig.banner.stateId = 'undefined';
        newConfig.banner.stateIdType = 'string';

        // reset authentication
        newConfig.authentication = {};
        newConfig.authentication.useauthentication = false;
        newConfig.authentication.username = '';
        newConfig.authentication.password = '';

        //console.log(newConfig);
        // save in localstorage
        localStorage.setItem ('appConfig', JSON.stringify (newConfig));
        // show loading
        state.workingBuffer.push ({
          jobUUID: UUID (),
          jobfunction: addWorkingNote,
          args: 'generate pages with import-data',
        });
        //generatePages();
        state.workingBuffer.push ({
          jobUUID: UUID (),
          jobfunction: generateImportPages,
          args: null,
        });
        // hide loading
        state.workingBuffer.push ({
          jobUUID: UUID (),
          jobfunction: removeWorkingNote,
          args: null,
        });
      } else {
        show_message (
          'Error importing config: Please connect socket first',
          'danger'
        );
      }
    }
  } catch (e) {
    console.error (e);
    show_message (e, 'danger');
  }
}

export function backupConfig (socket, data) {
  //backup config in file: backup_%ISO_DATE_TIME%.json
  if (socket) {
    let fileName = 'backup_' + new Date ().toISOString () + '.json';
    socket.emit (
      'writeFile',
      state.metaInfoSocketIO,
      state.filePath + '/' + fileName,
      data,
      function (error) {
        if (error) {
          console.log ('Error backup data in file: ' + error);
          console.log (error.name + ': ' + error.message);
          show_message ('Error backup data: ' + fileName, 'danger');
        } else {
          console.log ('Saving Config in file successfull');
          show_message ('data backup in: ' + fileName, 'success');
        }
      }
    );
  }
}

export function generateImportPages () {
  // helper function
  // to set fromImport = true
  generatePages (state.numberOfCols, true);
}

export function generateConfig (saveInFile = true) {
  console.log ('generating config');

  var newConfig = {};

  newConfig.timestamp = moment ();
  newConfig.version = state.version;

  newConfig.settings = {};
  // newConfig.settings.LayoutDunkel = !$("#chkLightMode")[0].checked;
  newConfig.settings.SplitterOpen = $ ('#chkSplitterOpen')[0].checked;

  newConfig.dataprovider = {};
  newConfig.dataprovider.type = 'iobroker';
  newConfig.dataprovider.url = $ ('#data-url-port').val ();
  newConfig.dataprovider.fileName = $ ('#select-configfile').val () + '.json';

  if (newConfig.dataprovider.fileName.length < 6) {
    newConfig.dataprovider.fileName = 'config_' + moment () + '.json';
  }
  if (
    newConfig.dataprovider.fileName.substring (
      newConfig.dataprovider.fileName.length - 5,
      newConfig.dataprovider.fileName.length
    ) !== '.json'
  ) {
    newConfig.dataprovider.fileName = newConfig.dataprovider.fileName + '.json';
  }

  newConfig.authentication = {};
  newConfig.authentication.useauthentication = $ ('#chkAuth')[0].checked;
  newConfig.authentication.username = $ ('#username').val ();
  newConfig.authentication.password = btoa ($ ('#password').val ());

  newConfig.pages = [];

  let pageOrderNb = 1; // (was implicit global)
  $ ('#pages .page').each (function () {
    var newPage = {};
    newPage.UUID = $ (this).attr ('id');

    if ($ ('#' + newPage.UUID).hasClass ('notRendered') === true) {
      // notRendered ==> Read from localStorage
      newPage = getPageDatafromLocalStorage (newPage.UUID);
    } else {
      newPage.title = $ (this).find ('.page-title').val ();
      newPage.icon = $ (this).find ('.iconSelectPage').attr ('data-icon');
      newPage.iconFamily =
        $ (this).find ('.iconSelectPage').attr ('data-family') ||
        state.defaultIconFamily;
      newPage.startpage = false;
      if ($ (this).find ('.isstartpage').get ([0]).checked === true) {
        newPage.startpage = true;
      }
      // pageOrder
      let pageOrder = $ (this).find ('input.page-order').val (); // (was implicit global)
      if (pageOrder < 1 || pageOrder > 99) {
        pageOrder = pageOrderNb;
      }
      newPage.order = pageOrder;
      pageOrderNb++;

      // read widgets
      newPage.widgets = [];
      $ (this).find ('.grid-widget.pageWidget').each (function () {
        var newWidget = readWidgetConfig ($ (this).attr ('id')); // (was implicit global)
        // write value
        console.log (newWidget);
        newPage.widgets.push (newWidget);
      });
    }

    newConfig.pages.push (newPage);
  });

  // sort page in config by page.order

  var sortedPages = sortPages (newConfig.pages); // (was implicit global, also otherwise unused - kept for parity)
  // console.log(sortedPages);

  //get banner-Data
  newConfig.banner = {};
  newConfig.banner.useBanner = $ ('#bannerUseBanner')[0].checked;
  newConfig.banner.stateId = $ ('#bannerStateId').val ();
  newConfig.banner.stateIdType = $ ('#bannerStateIdType').val ();

  //get theme
  newConfig.theme = CSSJSON.toJSON ($ ('#theme textarea').val ());

  //get global CSS for HTML Widgets
  newConfig.css = CSSJSON.toJSON ($ ('#css textarea').val ());

  // get config of AlarmPage
  newConfig.alarmpage = $ ('#chkAlarmPage')[0].checked;
  // get config of iobroker.minuaru
  newConfig.minuaru = $ ('#chkMinuAru')[0].checked;
  //console.log(newConfig);
  //console.log(JSON.stringify(newConfig));
  localStorage.setItem ('appConfig', JSON.stringify (newConfig));

  // qr-code
  let qrCodeData = {
    url: newConfig.dataprovider.url,
    type: newConfig.dataprovider.type,
    // configStateId: newConfig.dataprovider.configStateId,
    fileName: newConfig.dataprovider.fileName,
    useAuth: newConfig.authentication.useauthentication,
    user: newConfig.authentication.username,
    pass: newConfig.authentication.password,
  };
  let qrCodeDataString = JSON.stringify (qrCodeData);
  $ ('#imExport-qrcode-holder').html ('');
  let qrCode = qrcode (0, 'M');
  qrCode.addData (qrCodeDataString, 'Byte');
  qrCode.make ();
  $ ('#imExport-qrcode-holder').html (qrCode.createImgTag ());
  console.log ('generated QR-Code');
  // console.log(saveInFile);
  // console.log(socket);

  if (saveInFile === true) {
    // save in File (minukodu-config-FileName)
    if (state.socket) {
      console.log ('save in File ' + newConfig.dataprovider.fileName);
      //(filename, data, mode, callback)

      state.socket.emit (
        'writeFile',
        state.metaInfoSocketIO,
        state.filePath + '/' + newConfig.dataprovider.fileName,
        JSON.stringify (newConfig),
        function (error) {
          if (error) {
            console.log ('Error saving Config in file: ' + error);
            console.log (error.name + ': ' + error.message);
            show_message (
              'Error storing config in: ' + newConfig.dataprovider.fileName,
              'danger'
            );
          } else {
            console.log ('Saving Config in file successfull');
            show_message (
              'Stored config in: ' + newConfig.dataprovider.fileName,
              'success'
            );
            readConfigFiles (); // Update File dropdown
          }
        }
      );
    } else {
      show_message (
        'Error storing config: Please connect socket first',
        'danger'
      );
    }
  }
  if (state.workBufferWorking === true) {
    state.workBufferWorking = false;
  }
  return newConfig;
}

export function readWidgetConfig (widgetUUID) {
  var newWidget = {};
  newWidget.UUID = widgetUUID;
  var settingsTable = $ ('#props-' + newWidget.UUID);
  newWidget.type = settingsTable.find ('.prop-widgettype').data ('widgettype');

  // read widgets-props
  settingsTable.find ('.widget-prop').each (function () {
    //console.log(this);
    let propName = $ (this).data ('prop'); // (was implicit global)
    let propValue = $ (this).val (); // (was implicit global)
    let propType = $ (this).data ('type'); // (was implicit global)
    let propArrayKey = $ (this).data ('arraykey') || 0; // (was implicit global)
    let propArrayType = $ (this).data ('arraytype') || 'noarray'; // (was implicit global)

    if (propType == 'boolean') {
      propValue = stringToBoolean (propValue);
    }
    if (propType == 'number') {
      propValue = parseFloat (propValue);
    }
    // is value in array ???
    if (propArrayKey > 0) {
      let arrayType = 'array_' + propArrayType;
      if (newWidget[arrayType] === undefined) {
        newWidget[arrayType] = {};
      }
      if (newWidget[arrayType][propArrayKey] === undefined) {
        newWidget[arrayType][propArrayKey] = {};
      }
      newWidget[arrayType][propArrayKey][propName] = propValue;
    } else {
      newWidget[propName] = propValue;
    }
  });
  if (newWidget.type === 'card') {
    newWidget.widgets = [];

    $ ('#' + newWidget.UUID + ' .cardWidget').each (function () {
      var cardWidget = {};
      cardWidget.UUID = $ (this).attr ('id');
      var settingsTable = $ ('#props-' + cardWidget.UUID);
      cardWidget.type = settingsTable
        .find ('.prop-widgettype')
        .data ('widgettype');

      // read widgets-props
      settingsTable.find ('.widget-prop').each (function () {
        //console.log(this);
        let propName = $ (this).data ('prop'); // (was implicit global)
        let propValue = $ (this).val (); // (was implicit global)
        let propType = $ (this).data ('type'); // (was implicit global)
        let propArrayKey = $ (this).data ('arraykey') || 0; // (was implicit global)
        let propArrayType = $ (this).data ('arraytype') || 'noarray'; // (was implicit global)

        if (propType == 'boolean') {
          propValue = stringToBoolean (propValue);
        }
        if (propType == 'number') {
          propValue = parseFloat (propValue);
        }
        // is value in array ???
        if (propArrayKey > 0) {
          let arrayType = 'array_' + propArrayType;
          if (cardWidget[arrayType] === undefined) {
            cardWidget[arrayType] = {};
          }
          if (cardWidget[arrayType][propArrayKey] === undefined) {
            cardWidget[arrayType][propArrayKey] = {};
          }
          cardWidget[arrayType][propArrayKey][propName] = propValue;
          console.log (
            'cardWidget[' +
              arrayType +
              '][' +
              propArrayKey +
              '][' +
              propName +
              ']'
          );
        } else {
          cardWidget[propName] = propValue;
        }
      });
      console.log ('CardWidget:');
      console.log (cardWidget);
      newWidget.widgets.push (cardWidget);
    });
  }
  return newWidget;
}

export function init_sortable () {
  //var widgetHolders = document.getElementsByClassName("widget-holder");
  var widgetHolders = $ ('.widget-holder.active');

  [].forEach.call (widgetHolders, function (elem) {
    new Sortable (elem, {
      group: {
        name: 'shared',
      },
      animation: 150,
      handle: '.handle',
      onSort: function (/**Event*/ evt) {
        // set compactMode-Class
        addCompactModeClass ();
      },
      onChoose: function (/**Event*/ evt) {
        // collapse Widgets
        // $(".widget").find(".card-body").hide();
      },
      onEnd: function (/**Event*/ evt) {
        // expand Widgets
        // $(".widget").find(".card-body").show();
      },
    });
  });
}

export function connect_socket () {
  //console.log("Socket init");

  $ ('.form-connection .input-group-text')
    .removeClass ('alert-danger')
    .removeClass ('alert-sucess')
    .addClass ('alert-info');

  $ ('#btn-read-variables').attr ('disabled', 'disabled');
  $ ('#btn-read-configfiles').attr ('disabled', 'disabled');

  var socketUrl = $ ('#data-url-port').val ();
  console.log (socketUrl);

  var authentication = {};
  authentication.useauthentication = $ ('#chkAuth')[0].checked;
  authentication.username = $ ('#username').val ();
  authentication.password = btoa ($ ('#password').val ());

  //var socket   = io.connect('https://iobroker.pro', {path: "/socket.io"});
  // var socket = io.connect("http://nucci:9090", { path: "/socket.io" });

  // check authentication
  if (authentication.useauthentication === true) {
    console.log ('connect with auth');
    state.socket = io.connect (socketUrl, {
      query: {
        user: authentication.username,
        pass: atob (authentication.password),
      },
      path: '/socket.io',
    });
  } else {
    console.log ('connect without auth');
    state.socket = io.connect (socketUrl, {path: '/socket.io'});
  }

  state.variables = null; //JSON.parse(localStorage.getItem("variables") || null);

  state.socket.on ('connect', function () {
    console.log ('Connect ok');
    $ ('#btn-read-variables').removeAttr ('disabled');
    $ ('#btn-read-configfiles').removeAttr ('disabled');
    $ ('.form-connection .input-group-text')
      .removeClass ('alert-info')
      .addClass ('alert-success');
    show_message ('sucessfully connected', 'success');
    setTimeout (function () {
      readVariables ();
    }, 1000);
    setTimeout (function () {
      readConfigFiles ();
    }, 2000);
    //readVariables();
    //readConfigFiles()
  });
  state.socket.on ('connect_error', function () {
    console.log ('Connection failed');
    $ ('.form-connection .input-group-text')
      .removeClass ('alert-info')
      .addClass ('alert-danger');
    show_message ('error when connecting', 'danger');
    state.socket.disconnect ();
  });
  state.socket.on ('reconnect_failed', function () {
    console.log ('Reconnection failed');
    $ ('.form-connection .input-group-text')
      .removeClass ('alert-info')
      .addClass ('alert-danger');
    show_message ('error when connecting', 'danger');
    state.socket.disconnect ();
  });

  $ ('#btn-read-variables').click (function (event) {
    readVariables ();
  });

  $ ('#btn-read-configfiles').click (function (event) {
    readConfigFiles ();
  });
  $ ('#btn-read-configfiles-old').click (function (event) {
    readConfigFiles (true);
  });

  function readVariables () {
    console.log ('read variables');

    $ ('#btn-read-variables .btn-label i').attr (
      'class',
      'fas fa-spinner fa-spin'
    );
    $ ('#btn-read-variables').attr ('disabled', 'disabled');

    //console.log(socket);
    //console.log(socket.connected);
    localStorage.setItem ('variables', '');
    localStorage.setItem ('arrStates', '');

    //socket.emit("getStates", function (err, _states) {
    state.socket.emit ('getObjects', function (err, _states) {
      console.log ('Received ' + Object.keys (_states).length + ' states.');
      // console.log("_states");
      // console.log(_states);
      state.variablesAsObj = _states;
      state.variables = Object.keys (_states);
      localStorage.removeItem ('variables');
      localStorage.setItem ('variables', JSON.stringify (state.variables));
      state.variables = JSON.parse (localStorage.getItem ('variables'));
      console.log ('Stored ' + state.variables.length + ' states.');
      //console.log(variables);

      state.arrStates = [];
      for (const item in state.variablesAsObj) {
        state.arrStates.push (state.variablesAsObj[item]);
      }
      localStorage.removeItem ('arrStates');
      // console.error(arrStates);
      // to Big !!!!
      //localStorage.setItem("arrStates", JSON.stringify(arrStates));
      init_statesTypeahead ();

      //socket.emit("delObject","myAlarme.VisuMeldungen.Alarme.neuAlalrm");

      show_message ('Stored ' + state.variables.length + ' states.', 'success');

      $ ('#btn-read-variables').removeAttr ('disabled');
      $ ('#btn-read-variables .btn-label i').attr ('class', 'fas fa-list');
    });
  }
}

export function readConfigFiles (oldFolder = false) {
  $ ('#btn-read-configfiles .btn-label i').attr (
    'class',
    'fas fa-spinner fa-spin'
  );
  $ ('#btn-read-configfiles').attr ('disabled', 'disabled');

  var meta = state.metaInfoSocketIO;
  if (oldFolder === true) {
    meta = null;
  }

  state.socket.emit ('readDir', meta, '/' + state.filePath + '/', function (err, list) {
    console.log (err);
    console.log (list);
    $ ('#filelist li').remove ();
    let fileCount = 0;
    for (let file of list) {
      fileCount++;
      if (
        fileCount === list.length &&
        $ ('#select-configfile').val ().length < 1
      ) {
        $ ('#select-configfile').val (removeFileExtension (file.file));
      }
      if (
        file.isDir === false &&
        file.file.substring (file.file.length - 5, file.file.length) === '.json'
      ) {
        $ ('#filelist').prepend (
          '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" onclick="selectFileFromList(this)">' +
            removeFileExtension (file.file) +
            '</a></li>'
        );
      }
    }

    show_message ('Found ' + list.length + ' config-files.', 'success');

    $ ('#btn-read-configfiles').removeAttr ('disabled');
    $ ('#btn-read-configfiles .btn-label i').attr ('class', 'fas fa-list');
  });
}

// Exposed on window: called from inline onclick="selectFileFromList(this)"
// markup built in readConfigFiles() above - inline HTML attribute handlers
// can only resolve real window properties, not ESM module bindings. See
// the window-exposure block at the bottom of this file.
export function selectFileFromList (elem) {
  //console.log(elem);
  $ ('#select-configfile').val (elem.text);
  readConfigFromFile (elem.text + '.json');
}

export function readConfigFromFile (fileName, oldFolder = false) {
  var meta = state.metaInfoSocketIO;
  console.log ('readFile: ' + meta + ',' + state.filePath + '/' + fileName);
  if (state.socket) {
    state.socket.emit ('readFile', meta, state.filePath + '/' + fileName, function (
      error,
      fileData,
      mimeType
    ) {
      console.log (mimeType);
      //console.log(fileData);
      console.log (error);
      var newConfig = JSON.parse (fileData);
      // check Version
      var version = 1;
      if (newConfig.version) {
        version = parseInt (newConfig.version, 10);
      }
      console.log ('version of config-file: ' + version);
      show_message ('version of config-file: ' + version, 'success');

      if (version < 2) {
        // import data from older version
        importConfig (fileData, 0, null);
        return;
      }
      // version ok
      localStorage.setItem ('appConfig', fileData);
      // show loading
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: addWorkingNote,
        args: 'read config from file',
      });
      //addPage();
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: generatePages,
        args: state.numberOfCols,
      });
      // hide loading
      state.workingBuffer.push ({
        jobUUID: UUID (),
        jobfunction: removeWorkingNote,
        args: null,
      });
      //generateConfig();
      //generatePages();
    });
  } else {
    show_message (
      'Error loading config: Please connect socket first',
      'danger'
    );
  }
}

export function deleteConfigFile (fileName) {
  if (state.socket) {
    state.socket.emit (
      'unlink',
      state.metaInfoSocketIO,
      state.filePath + '/' + fileName,
      function (error) {
        console.log (error);
        show_message ('file deleted: ' + fileName, 'success');
      }
    );
  } else {
    show_message ('Error delete file: Please connect socket first', 'danger');
  }
}

export function init_statesTypeahead () {
  // console.log("arrStates");
  // console.log(arrStates);

  // default to prevent errors
  let arrStatesTypeAhead = [
    {
      _id: 'please connect first',
      common: {
        name: 'no entries yet',
        type: 'undefined',
      },
    },
  ];

  if (state.arrStates) {
    arrStatesTypeAhead = JSON.parse (JSON.stringify (state.arrStates));
  }

  // var statesSearchEngine = new Bloodhound({
  //   local: arrStatesTypeAhead,
  //   queryTokenizer: Bloodhound.tokenizers.nonword,
  //   datumTokenizer: Bloodhound.tokenizers.obj.nonword('_id', 'common.name'),
  // });
  // console.log("statesSearchEngine");
  // console.log(statesSearchEngine);

  $ ('.states-select .typeahead').typeahead ('destroy');
  $ ('.states-select .typeahead').typeahead (
    {
      hint: true,
      highlight: true,
      minLength: 1,
    },
    {
      name: 'states',
      display: '_id',
      // source: statesSearchEngine,
      // source: substringMatcher(variables),
      source: substringMatcher (arrStatesTypeAhead),
      limit: 100,
      templates: {
        // empty: [
        //   '<div class="empty-message">',
        //     'unable to find any state that match the current query',
        //   '</div>'
        // ].join('\n'),
        // Was Handlebars.compile('<div>{{name}} -- {{num}}</div>') style;
        // Handlebars itself removed (80KB dependency for this one call site)
        // - typeahead's `suggestion` template just needs a (datum => html)
        // function, so a plain template literal does the exact same job.
        suggestion: (item) =>
          `<div><div><strong>${item._id}</strong></div><div><small>${item.common.name}&nbsp;&nbsp;&nbsp;&nbsp;type: <stateIdType>${item.common.type}</stateIdType></small></div>`,
      },
    }
  );
}

var substringMatcher = function (strs) {
  return function findMatches (q, cb) {
    // var matches, substringRegex;

    // // an array that will be populated with substring matches
    // matches = [];
    // let objMatches = {};
    // objMatches.value = [];

    // regex used to determine if a string contains the substring `q`
    // substrRegex = new RegExp(q, "i");

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    // $.each(strs, function (i, str) {
    //   if (substrRegex.test(str)) {
    //     matches.push(str);
    //     objMatches.value.push(str);
    //   }
    // });
    let lowerCaseQ = q.toLowerCase ();
    // console.log(lowerCaseQ);

    var arrFllterResult = strs.filter (function (el) {
      let rName = -1;
      try {
        rName = el.common.name.toLowerCase ().indexOf (lowerCaseQ);
      } catch (e) {}

      return el._id.toLowerCase ().indexOf (lowerCaseQ) > -1 || rName > -1;
    });

    //cb(matches);
    //console.log(arrFllterResult);
    cb (arrFllterResult);
  };
};

// Exposed on window: called from inline onclick="toggleAllMessages();"
// markup built in show_message() below.
export function toggleAllMessages () {
  $ ('#message-holder').toggleClass ('showAll');
}

export function show_message (message = 'message', color = 'danger') {
  $ ('#message-holder')
    .prepend (
      '<div class="message alert" role="alert" onclick="toggleAllMessages();"></div>'
    )
    .find ('.alert')
    .first ()
    .addClass ('bg-' + color)
    .text (message)
    .fadeIn ('fast')
    .fadeOut ('fast')
    .fadeIn ('fast')
    .fadeOut ('fast')
    .fadeIn ('fast');
}

export function init_modal () {
  $ ('#selectModal').on ('show.bs.modal', function (event) {
    var button = $ (event.relatedTarget); // Button that triggered the modal
    var modalClass = button.data ('select'); // Extract info from data-* attributes
    $ (this)
      .removeClass ('iconSelect stateSelect iconFaSelect')
      .addClass (modalClass);
    //$(this).data("widget", button.closest('.widget').data('id'));
    $ (this).attr ('data-page', button.closest ('.page').attr ('id'));
    $ (this).attr ('data-widget', button.closest ('.widget').attr ('id'));
    $ (this).attr ('data-class', modalClass);
    $ (this).attr ('data-button', button.attr ('id'));

    $ (this).find ('div.hide-at-start').hide ();

    // console.log("modalClass");
    // console.log(modalClass);

    if (modalClass.indexOf ('tate') > 0) {
      // do we have states ???
      var nbVariables = 0;
      if (state.variables) {
        nbVariables = state.variables.length;
      }
      var infoBgClass = 'bg-success pt-1 pb-1 pl-1';
      var infoText = nbVariables + ' states to select';
      if (nbVariables < 1) {
        infoBgClass = 'bg-danger pt-1 pb-1 pl-1';
        infoText = 'Please connect and read states first !';
      }
      $ ('#modal-states-info-text')
        .removeClass ()
        .addClass (infoBgClass)
        .text (infoText);

      $ (this).find ('div.states-select').show ();
    }
    if (modalClass.indexOf ('iconFa') > 0) {
      $ (this).find ('div.fa-icon-select').show ();
    }
    if (modalClass.indexOf ('conSe') > 0) {
      $ (this).find ('div.mfd-icon-select').show ();
    }
    if (modalClass.indexOf ('ileSe') > 0) {
      $ (this).find ('div.file-select').show ();
    }
    //$('#mfd-iconselect-dropdown.dropdown').dropdown("hide");
  });

  $ ('#selectModal .btn-ok').click (function () {
    $ ('#selectModal').modal ('hide');
  });

  $ ('#selectModal').on ('hide.bs.modal', function () {
    submit_modal ();
  });
  // init icon dropdown
  $ ('.icon-select select').text ('');
  // iconselect.html lives in public/ (Vite copies public/** to the build
  // root verbatim) - root-relative path works in both dev and build.
  $ ('.icon-select').load ('/iconselect.html', function () {
    $ ('#mfd-iconselect-dropdown.dropdown').dropdown ();
    init_iconselect_dropdown ();
  });
}

export function init_iconselect_dropdown () {
  $ ('#mfd-iconselect-dropdown .dropdown-menu button').click (function (event) {
    event.preventDefault ();
    console.log ($ (this).data ('iconvalue'));
    $ ('#mfd-iconselect-dropdown .icon-holder i')
      .removeClass ()
      .addClass ('mfd-icon ' + $ (this).data ('iconvalue'))
      .attr ('data-iconvalue', $ (this).data ('iconvalue'));
    console.log ($ ('#mfd-iconselect-dropdown .icon-holder i'));
    //$('#mfd-iconselect-dropdown.dropdown').dropdown("hide");
    $ ('#selectModal').modal ('hide');
  });
}

export function submit_modal () {
  var pageId = $ ('#selectModal').attr ('data-page');
  var modalClass = $ ('#selectModal').attr ('data-class');
  var buttonId = $ ('#selectModal').attr ('data-button');
  console.log (modalClass);
  console.log (buttonId);

  var value = '';
  let family; // (was implicit global)
  let values; // (was implicit global)
  if (modalClass.indexOf ('tate') > 0) {
    // submit state
    family = 'none';
    let stateId = $ ('#selectModal .tt-input').not ('.tt-hint').val (); // (was implicit global)

    let stateIdType = getStateType (stateId); // (was implicit global)

    console.log (stateId + ' :: ' + stateIdType);

    if (stateId.length > 0) {
      $ ('#' + buttonId).attr ('value', stateId);
      $ ('#' + buttonId).val (stateId);
      $ ('#' + buttonId + ' option').remove ();
      $ ('#' + buttonId).append (
        $ (
          '<option selected="selected" value="' +
            stateId +
            '">' +
            stateId +
            '</option>'
        )
      );
      let widgetID = $ ('#' + buttonId)
        .closest ('tbody')
        .find ('td.prop-uuid')
        .attr ('data-uuid');
      $ ('#' + widgetID + ' .info')
        .text (stateId)
        .attr ('title', stateId)
        .removeClass ('danger');

      $ ('#' + buttonId)
        .closest ('tr')
        .next ()
        .find ('.prop-stateIdType')
        .first ()
        .attr ('value', stateIdType);
      $ ('#' + buttonId)
        .closest ('tr')
        .next ()
        .find ('.prop-stateIdType')
        .first ()
        .first ()
        .val (stateIdType);
    }
  } else if (modalClass.indexOf ('conSelectPage') > 0) {
    // submit mfd-icon
    //value = $("#mfd-iconselect-dropdown .icon-holder i").attr("data-iconvalue");

    var iconClasses = $ ('#icp-mfd').attr ('data-iconvalue');
    console.log ('iconClasses ############################');
    console.log (iconClasses);

    value = 'audio_audio';
    family = 'mfd-icon';
    if (iconClasses !== undefined) {
      values = iconClasses.split (' ');
      family = values[0];
      value = values[1];
    }

    console.log ('from modal:');
    console.log (value);

    $ ('#' + pageId + ' .' + modalClass).attr ('data-icon', value);
    $ ('#' + pageId + ' .' + modalClass).attr ('data-family', family);
    $ ('#' + pageId + ' .' + modalClass)
      .find ('i')
      .removeClass ()
      .addClass (family + ' ' + value);
    // nav-iocn left sidebar
    $ (".nav-item[data-id='" + pageId + "']")
      .find ('i.nav-icon')
      .removeClass ()
      .addClass (family + ' nav-icon ' + value);
  } else if (modalClass.indexOf ('conSelect') > 0) {
    // submit mfd-icon
    //value = $("#mfd-iconselect-dropdown .icon-holder i").attr("data-iconvalue");

    var iconClasses = $ ('#icp-mfd').attr ('data-iconvalue');
    console.log ('iconClasses ############################');
    console.log (iconClasses);

    value = 'audio_audio';
    family = 'mfd-icon';
    if (iconClasses !== undefined) {
      values = iconClasses.split (' ');
      family = values[0];
      value = values[1];
    }

    //////// no Icon possible
    if (value === 'aa_noIcon') {
      family = 'noIcon';
    }

    console.log ('from modal:');
    console.log (value);

    $ ('#' + buttonId).attr ('value', value);
    $ ('#' + buttonId).val (value);
    $ ('#' + buttonId).attr ('data-family', family);
    $ ('#' + buttonId + ' i').removeClass ().addClass (family + ' ' + value);

    $ ('#' + buttonId)
      .closest ('tr')
      .next ()
      .find ('.type-iconFamily')
      .first ()
      .attr ('value', family);
    $ ('#' + buttonId)
      .closest ('tr')
      .next ()
      .find ('.type-iconFamily')
      .first ()
      .first ()
      .val (family);
  } else if (modalClass.indexOf ('ileSelect') > 0) {
    // submit file

    value = $ ('#modal-file-preview img').attr ('src');

    // console.log("from modal:");
    // console.log(value);

    $ ('#' + buttonId).attr ('value', value);
    $ ('#' + buttonId).val (value);
    $ ('#' + buttonId + ' option').remove ();
    $ ('#' + buttonId).append (
      $ (
        '<option selected="selected" value="' +
          value +
          '">' +
          value +
          '</option>'
      )
    );
  }
}

// Exposed on window: called from inline onclick="modalPreviewFile();"
// markup in index.html (file-upload modal preview).
export function modalPreviewFile () {
  const file = $ ('#modalFileInput')[0].files[0];
  const reader = new FileReader ();

  reader.addEventListener (
    'load',
    function () {
      // convert image file to base64 string
      $ ('#modal-file-preview img').attr ('src', reader.result);
    },
    false
  );

  if (file) {
    reader.readAsDataURL (file);
    // console.log("############# image loaded: ")
    // console.log(file);
  }
}

export function removeFileExtension (fileName) {
  return fileName.split ('.').slice (0, -1).join ('.');
}

export function showPreviewQrCode (url) {
  console.log ('generate QR-Code from: ' + url);
  $ ('#preview-qrcode-holder').html ('');
  let preViewQrCode = qrcode (0, 'M');
  preViewQrCode.addData (url, 'Byte');
  preViewQrCode.make ();
  $ ('#preview-qrcode-holder').html (preViewQrCode.createImgTag ());
  //console.log("generated QR-Code from: " + url);
}

export function clearBrowserCache () {
  localStorage.clear ();
  location.replace (location.href);
  location.reload ();
}

export function addCompactModeClass () {
  $ ('.widget').removeClass ('compactMode').removeAttr ('data-compactMode');
  $ ('.compactModeStart')
    .nextUntil ('.compactModeEnd', '.widget')
    .addClass ('compactMode')
    .attr ('data-compactMode', 'compactMode');
}

export function getStateType (stateId) {
  // console.log("getStateType");
  // console.log(stateId);
  // console.log("getStateType");
  // console.log(arrStates);

  let type = 'undefined';
  let arrFllterResult = [];
  try {
    arrFllterResult = state.arrStates.filter (function (el) {
      return el._id === stateId;
    });
  } catch (e) {
    console.error (e);
  }

  // console.log("arrFllterResult:");
  // console.log(arrFllterResult);
  try {
    type = arrFllterResult[0].common.type;
  } catch (e) {
    // console.error(e);
    show_message (
      'Error creating config please connect socket first',
      'danger'
    );
  }
  return type;
}

export function sanitize (input) {
  var replacement = '_';

  var illegalRe = /[\/\?<>\\:\*\|"]/g;
  var controlRe = /[\x00-\x1f\x80-\x9f]/g;
  var reservedRe = /^\.+$/;
  var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  var windowsTrailingRe = /[\. ]+$/;

  if (typeof input !== 'string') {
    throw new Error ('Input must be string');
  }
  var sanitized = input
    .replace (illegalRe, replacement)
    .replace (controlRe, replacement)
    .replace (reservedRe, replacement)
    .replace (windowsReservedRe, replacement)
    .replace (windowsTrailingRe, replacement);
  return sanitized;
}

export function stringToBoolean (val) {
  if (val === null) {
    return false;
  }
  if (typeof val === 'number') {
    return Boolean (val);
  }
  if (typeof val !== 'string') {
    return val;
  }
  switch (val.toLowerCase ().trim ()) {
    case 'on':
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'off':
    case 'false':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean (val);
  }
}

export function addWorkingNote (html = 'generating pages') {
  //console.log(new Date().toISOString() + " show working note: " + html);
  $ ('#workingNote .text').html (html);
  $ ('#workingNote').css ('display', 'block');
  $ ('#loading').show ();
  state.workBufferWorking = false;
}

export function removeWorkingNote () {
  //console.log(new Date().toISOString() + " hide working note");
  $ ('#workingNote').css ('display', 'none');
  $ ('#loading').hide ();
  state.workBufferWorking = false;
}

/**
 * Was a bare (no var/let/const) global function expression that recursed
 * via `this.findAllByKey(...)`, relying on non-strict-mode `this === window`
 * - meaningless (this === undefined) at ES module top level, would throw
 * immediately. Rewritten as a normal named function with a direct
 * recursive call. Reduction logic itself is unchanged.
 */
export function findAllByKey (obj, keyToFind) {
  return Object.entries (obj).reduce (
    (acc, [key, value]) =>
      key == keyToFind
        ? acc.concat (value)
        : typeof value === 'object'
            ? acc.concat (findAllByKey (value, keyToFind))
            : acc,
    []
  );
}

export function setAllByKey (obj, keyToFind, valueToSet) {
  for (var key in obj) {
    if (typeof obj[key] == 'object') {
      setAllByKey (obj[key], keyToFind, valueToSet);
    } else if (key == keyToFind) {
      obj[key] = valueToSet;
    }
  }
}

// Window-exposure compat shim: the functions below are invoked from inline
// onclick="..." HTML attributes in markup this file (or page_fkt.js/
// widget_fkt.js) generates as strings. Inline attribute handlers can only
// call real `window` properties, never ESM module-scoped bindings - so
// these three must stay real globals. Rewriting the markup to use
// addEventListener-based event delegation instead is deferred to a future
// phase (see plan notes / README changelog), not done in this migration.
Object.assign (window, {
  selectFileFromList,
  toggleAllMessages,
  modalPreviewFile,
});
