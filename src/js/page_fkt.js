/**
 * Page CRUD and rendering: generatePages() rebuilds the entire editor UI
 * from localStorage.appConfig (used on load and after import), addPage()
 * creates one page tab + GridStack grid, addAllWidgetsToOnePage() handles
 * the legacy v1-config-import compatibility branch (splitting old
 * combined title+state widgets into a separate filler + widget pair).
 * Converted to an ES module (2026-08 migration) - logic unchanged, see
 * helper_fkt.js's file header for the general conversion approach.
 */
import $ from 'jquery';
import { GridStack } from 'gridstack';
import { state } from './state.js';
import { UUID } from '../vendor/uuid-v4.js';
import { CSSJSON } from '../vendor/cssjson.js';
import { addWidgetToPage, init_widget_dropdown, updateWidgetSize } from './widget_fkt.js';
import { addWorkingNote, removeWorkingNote, generateConfig } from './helper_fkt.js';

// GridStack v7+ defaults widget `content` to `el.textContent = w.content`
// (XSS hardening - renders any HTML as escaped plain text). This app has
// always generated real HTML strings for widget content itself (see
// addWidgetToPage() in widget_fkt.js) and is not accepting arbitrary
// untrusted input there, so the old (pre-v7) "insert as HTML" behavior
// needs to be restored explicitly. Must run before any GridStack.addGrid()/
// addWidget() call - module-top-level here guarantees that.
GridStack.renderCB = (el, w) => {
  if (el && w?.content) {
    el.innerHTML = w.content;
  }
};

// setGridCols() was already dead before this migration: referenced via
// inline onchange="setGridCols(this);" in index.html, but its definition
// was commented out here - calling that control already threw
// ReferenceError in the browser console. Preserved as a known pre-existing
// issue (not introduced by this migration, not fixed here - "no behavior
// change" applies to bugs too, not just features).
// function setGridCols(element) {
//   // console.log($(element));
//   // console.log($(element).val())
//   generatePages($(element).val());
// }

/**
 * Called right after generatePages() on app start (see main.js's init job
 * queue). generatePages() rebuilds the page list from
 * localStorage.appConfig and wipes any pre-existing DOM pages first - so
 * checking "any pages?" only makes sense AFTER it has run, not before.
 * Fresh install / empty config -> no pages get rebuilt -> create one
 * default "Startpage" so the editor never opens completely empty.
 *
 * Every workingBuffer job function MUST set state.workBufferWorking = false
 * before returning - that's the "I'm done" signal workWithBuffer() polls
 * for (see main.js). Forgetting it here left the queue stuck forever with
 * no error, since nothing throws - just silently never advances past this
 * job, so removeWorkingNote() (which hides the loading overlay) never runs.
 */
export function ensureStartpage () {
  if ($ ('#pages .page').length === 0) {
    console.log ('no pages found - creating default Startpage');
    addPage ({ title: 'Startpage', startpage: true });
  }
  state.workBufferWorking = false;
}

export function generatePages (nbOfCols = 18, fromImport = false) {
  console.log ('generating pages from config');
  console.log ('nbOfCols: ' + nbOfCols + ' fromImport: ' + fromImport);

  // delete all pages
  $ ('#pages .page').remove ();
  $ ('.menu-link-page').remove ();
  $ ('.page-nav-item').remove ();
  $ ('.sidebar-settings-table').remove ();
  $ ('#props-nowidget').removeClass ('hidden');

  let appConfig = {};
  try {
    appConfig = JSON.parse (localStorage.getItem ('appConfig', '{}'));
  } catch (e) {}

  // Data Connection
  if (appConfig && appConfig.dataprovider) {
    $ ('#data-url-port').val (appConfig.dataprovider.url);
    $ ('#data-url-port').attr ('value', appConfig.dataprovider.url);
  }

  // reset and set authentication
  $ ('#chkAuth')[0].checked = false;
  $ ('#username').val ('');
  $ ('#password').val ('');
  $ ('#credentialswrapper').hide ();

  try {
    $ ('#chkAuth')[0].checked = appConfig.authentication.useauthentication;
    $ ('#username').val (appConfig.authentication.username);
    $ ('#password').val (atob (appConfig.authentication.password));
    if (appConfig.authentication.useauthentication === true) {
      $ ('#credentialswrapper').show ();
    } else {
      $ ('#credentialswrapper').hide ();
    }
  } catch (e) {
    console.log ('error@authdata:');
    console.log (e);
  }

  // settings
  if (appConfig && appConfig.settings) {
    $ ('#chkSplitterOpen')[0].checked = appConfig.settings.SplitterOpen;
    $ ('#chkLightMode')[0].checked = !appConfig.settings.LayoutDunkel;
  }

  // AlarmPage
  $ ('#chkAlarmPage')[0].checked = false;
  if (appConfig && appConfig.alarmpage) {
    $ ('#chkAlarmPage')[0].checked = appConfig.alarmpage;
  }
  // ioBroker.minaru
  $ ('#chkMinuAru')[0].checked = false;
  if (appConfig && appConfig.minuaru) {
    $ ('#chkMinuAru')[0].checked = appConfig.minuaru;
  }

  localStorage.removeItem ('pageData');
  let pageData = {};
  let firstPage = true;
  // pages
  if (appConfig && appConfig.settings) {
    for (var pageId in appConfig.pages) {
      var pageUUID = addPage (appConfig.pages[pageId], nbOfCols);
      console.log ('page added with: ' + pageUUID);
      console.log (appConfig.pages[pageId]);
      // save pageData
      pageData[pageUUID] = appConfig.pages[pageId];
      // UUID = null when imported
      pageData[pageUUID].UUID = pageUUID;
      console.log (pageData);
      if (firstPage !== true && fromImport !== true) {
        // not render Widgets
        $ ('#' + pageUUID).addClass ('notRendered');
      } else {
        firstPage = false;
        $ ('#' + pageUUID).removeClass ('notRendered');
        $ ('#' + pageUUID).addClass ('rendered');

        // #######################################################################################
        addAllWidgetsToOnePage (pageData[pageUUID]);
        // ########################################################################################
      }
    }
    console.log ('store pageData in localStorage');
    localStorage.setItem ('pageData', JSON.stringify (pageData));
  }

  // delete and set banner
  // console.log("write bannerdata:");
  // console.log(appConfig.banner);

  try {
    $ ('#bannerUseBanner')[0].checked = appConfig.banner.useBanner;
    $ ('#bannerStateId').data ('value', appConfig.banner.stateId);
    $ ('#bannerStateId').data ('stateid', appConfig.banner.stateId);
    $ ('#bannerStateId').find ('option').remove ();
    $ ('#bannerStateId').append (
      $ (
        '<option selected="selected" value="' +
          appConfig.banner.stateId +
          '">' +
          appConfig.banner.stateId +
          '</option>'
      )
    );
    $ ('#bannerStateIdType').val (appConfig.banner.stateIdType);
  } catch (e) {
    console.log ('error@bannerdata:');
    console.log (e);
  }
  // delete and populate theme
  $ ('#theme textarea').val ('');
  if (appConfig && appConfig.theme) {
    $ ('#theme textarea').val (CSSJSON.toCSS (appConfig.theme));
  }

  // delete and populate CSS
  $ ('#css textarea').val ('');
  if (appConfig && appConfig.css) {
    $ ('#css textarea').val (CSSJSON.toCSS (appConfig.css));
  }

  var firstPageUUID = $ ('.menu-link-page').first ().attr ('href'); // (was implicit global)
  //console.log("FirstPageUUID: " + firstPageUUID);
  showPage (firstPageUUID);
  state.workBufferWorking = false;
  //console.log("done");
}

export function loadWidgets (pageUUID) {
  if ($ ('#' + pageUUID).hasClass ('rendered') === true) {
    return;
  }
  console.log ('load and add widgets for page with uuid: ' + pageUUID);

  // show loading
  state.workingBuffer.push ({
    jobUUID: UUID (),
    jobfunction: addWorkingNote,
    args: 'load widgets',
  });
  //addAllWidgetsToOnePage();
  state.workingBuffer.push ({
    jobUUID: UUID (),
    jobfunction: addAllWidgetsToOnePage,
    args: getPageDatafromLocalStorage (pageUUID),
  });
  // hide loading
  state.workingBuffer.push ({
    jobUUID: UUID (),
    jobfunction: removeWorkingNote,
    args: null,
  });
  //addAllWidgetsToOnePage(getPageDatafromLocalStorage(pageUUID));

  $ ('#' + pageUUID).addClass ('rendered');
  $ ('#' + pageUUID).removeClass ('notRendered');
}

export function getPageDatafromLocalStorage (pageUUID) {
  var pagesData = JSON.parse (localStorage.getItem ('pageData'));
  return pagesData[pageUUID];
}

export function addAllWidgetsToOnePage (pageData) {
  console.log ('add all widgets to: ' + pageData.UUID);
  console.log (state.grids);

  let pageUUID = pageData.UUID;
  let headLineTextColor = pageData.headLineTextColor;
  for (var widgetId in pageData.widgets) {
    //console.log(appConfig.pages[pageId].widgets[widgetId]);
    var widget = pageData.widgets[widgetId];
    // console.log(widget.type);
    // console.log(pageUUID);

    var imported = widget.imported;
    console.log ('imported: ' + imported);
    // start imported widgetdata ####################################################################################################
    // if we have an imported widget we must separate icon and titel to filler
    if (imported === true && widget.type != 'card') {
      widget.imported = false; // reset

      if (widget.type == 'compactModeStart') {
        continue;
      }
      if (widget.type == 'compactModeEnd') {
        continue;
      }
      if (widget.type == 'gridChanger') {
        continue;
      }

      // slider is now range
      if (widget.type == 'slider') {
        widget.type = 'range';
      }
      var fillerFullWidth = false;
      // set height
      if (widget.height && parseInt (widget.height, 10) > 0) {
        widget.widgetHeight = parseInt (parseInt (widget.height, 10) / 67, 10); // height / 67px
        fillerFullWidth = true;
      }
      // set height when donut
      if (widget.type == 'donut') {
        widget.widgetHeight = 3; // height
      }

      if (
        widget.title !== 'NONE' &&
        widget.type !== 'filler' &&
        widget.type !== 'card'
      ) {
        var fillerWidget = {};
        if (widget.widgetWidth > 9) {
          widget.widgetWidth = 6;
          fillerWidget.widgetWidth = 12;
        } else {
          widget.widgetWidth = 3;
          fillerWidget.widgetWidth = 6;
        }
        if (fillerFullWidth === true) {
          fillerWidget.widgetWidth = 18;
          widget.widgetWidth = 18;
        }
        fillerWidget.type = 'filler';
        fillerWidget.widgetHeight = widget.widgetHeight;
        fillerWidget.borderTop = true;
        fillerWidget.borderRight = false;
        fillerWidget.borderBottom = true;
        fillerWidget.borderLeft = true;
        fillerWidget.timestamp = false;
        fillerWidget.titleIcon = widget.titleIcon;
        fillerWidget.titleIconFamily = widget.titleIconFamily;
        fillerWidget.title = widget.title;
        fillerWidget.color = headLineTextColor;
        // set border
        widget.borderTop = true;
        widget.borderRight = true;
        widget.borderBottom = true;
        widget.borderLeft = false;
        widget.timestamp = false;

        // set fullwidth
        if (fillerFullWidth === true) {
          fillerWidget.widgetWidth = 18;
          widget.widgetWidth = 18;
          fillerWidget.widgetHeight = 1;
        }
        widgetUUID = addWidgetToPage (
          fillerWidget.type,
          pageUUID,
          fillerWidget,
          state.grids[pageUUID]
        );
      }
    }
    // end imported widgetdata ####################################################################################################
    var widgetUUID = '';
    if (widget.type !== 'card') {
      widgetUUID = addWidgetToPage (
        widget.type,
        pageUUID,
        widget,
        state.grids[pageUUID]
      );
    } else {
      // add Card
      // start imported widgetdata ####################################################################################################
      var imported = widget.imported;
      if (imported === true) {
        widget.widgetHeight = widget.widgets.length + 1;
      }
      // end imported widgetdata ####################################################################################################

      // add linkrefrences to page data if any
      if (widget.linkReference && widget.linkReference.length > 0) {
        var pageLinkRefs = $ ('#' + pageUUID).attr ('data-linkreferences');
        if (pageLinkRefs) {
          pageLinkRefs = pageLinkRefs + ' ' + widget.linkReference;
        } else {
          pageLinkRefs = widget.linkReference;
        }
        $ ('#' + pageUUID).attr ('data-linkreferences', pageLinkRefs);
      }

      var cardUUID = addWidgetToPage (
        widget.type,
        pageUUID,
        widget,
        state.grids[pageUUID]
      );
      var imported = widget.imported;
      widget.imported = false; // reset
      // add Sub-Widgets

      console.log ('all cardWidgets:');
      console.log (widget.widgets);
      console.log (cardUUID);

      for (var cardWidgetId in widget.widgets) {
        var cardWidget = widget.widgets[cardWidgetId];

        // start imported widgetdata ####################################################################################################
        // if we have an imported widget we must separate icon and titel to filler
        console.log ('imported: ' + imported);
        if (imported === true) {
          if (cardWidget.type == 'compactModeStart') {
            continue;
          }
          if (cardWidget.type == 'compactModeEnd') {
            continue;
          }
          if (cardWidget.type == 'gridChanger') {
            continue;
          }
          cardWidget.widgetWidth = 18;
          cardWidget.borderTop = false;
          cardWidget.borderRight = false;
          cardWidget.borderBottom = false;
          cardWidget.borderLeft = false;
          cardWidget.timestamp = false;

          // slider is now range
          if (cardWidget.type == 'slider') {
            cardWidget.type = 'range';
          }
          var fillerFullWidth = false;
          // set height
          if (cardWidget.height && parseInt (cardWidget.height, 10) > 0) {
            cardWidget.widgetHeight = parseInt (
              parseInt (cardWidget.height, 10) / 67,
              10
            ); // height / 67px
            fillerFullWidth = true;
          }
          // set height when donut
          if (cardWidget.type == 'donut') {
            cardWidget.widgetHeight = 3; // height
          }

          if (cardWidget.title !== 'NONE' && cardWidget.type !== 'filler') {
            var fillerWidget = {};
            cardWidget.widgetWidth = 6;
            fillerWidget.widgetWidth = 12;
            fillerWidget.type = 'filler';
            fillerWidget.widgetHeight = cardWidget.widgetHeight;
            fillerWidget.borderTop = false;
            fillerWidget.borderRight = false;
            fillerWidget.borderBottom = false;
            fillerWidget.borderLeft = false;
            fillerWidget.timestamp = false;
            fillerWidget.titleIcon = cardWidget.titleIcon;
            fillerWidget.titleIconFamily = cardWidget.titleIconFamily;
            fillerWidget.title = cardWidget.title;
            fillerWidget.color = headLineTextColor;
            // set fullwidth
            if (fillerFullWidth === true) {
              fillerWidget.widgetWidth = 18;
              cardWidget.widgetWidth = 18;
              fillerWidget.widgetHeight = 1;
            }
            widgetUUID = addWidgetToPage (
              fillerWidget.type,
              cardUUID,
              fillerWidget,
              state.grids[cardUUID],
              true
            );
          }
          // set full width if title of card
          if (cardWidget.cardtitle) {
            cardWidget.widgetWidth = 18; // width
            cardWidget.color = headLineTextColor;
          }
        }
        // end imported widgetdata ####################################################################################################
        // console.log("CardWidget:");
        // console.log(cardWidget);
        widgetUUID = addWidgetToPage (
          cardWidget.type,
          cardUUID,
          cardWidget,
          state.grids[cardUUID],
          true
        );
      }
    }
  }
  state.workBufferWorking = false;
}

export function showPage (UUID) {
  $ ('#css').hide ();
  $ ('#theme').hide ();
  $ ('#bannerData').hide ();
  $ ('#imExportSection').hide ();
  $ ('.page').hide ();
  $ ('.widget-holder').removeClass ('active');
  $ (UUID + ' .widget-holder').addClass ('active');
  $ (UUID).show (100);
}

export function sortPages (pages = {}) {
  pages.sort (sortFunction);

  function sortFunction (a, b) {
    if (parseInt (a.order, 10) > parseInt (b.order, 10)) {
      return 1;
    } else {
      return -1;
    }
  }
  // reorder pages
  var i = 1;
  for (var page in pages) { // (was implicit global)
    pages[page].order = i;
    i++;
  }
  return pages;
}

export function addPage (pageData = {}, nbOfCols = 18) {
  console.log ('addpage with ' + pageData.UUID);
  var uuid = pageData.UUID || UUID ();
  var pageTitle = pageData.title || 'PageName';
  var pageIsStartpage = pageData.startpage || false;
  var pageIcon = pageData.icon || 'audio_play';
  var pageIconFamily = pageData.iconFamily || state.defaultIconFamily;
  var pageOrder = pageData.order || $ ('.page').length + 1;

  var newPage = $ (state.templates.page)
    .clone ()
    .attr ('id', uuid)
    .attr ('data-id', uuid);
  $ (newPage)
    .find ('input.page-title')
    .attr ('value', pageTitle)
    .attr ('data-id', uuid)
    .attr ('id', 'pageTitle-' + uuid);

  $ (newPage)
    .find ('.iconSelectPage')
    .val (pageIcon)
    .attr ('data-icon', pageIcon)
    .attr ('data-family', pageIconFamily);
  $ (newPage)
    .find ('.iconSelectPage i')
    .removeClass ()
    .addClass (pageIconFamily + ' ' + pageIcon);

  if (pageIsStartpage) {
    $ (newPage).find ('.isstartpage').attr ('checked', 'checked');
  }
  $ (newPage).find ('input.page-order').attr ('value', pageOrder);
  $ (newPage).find ('input.page-order').change (function () {
    $ ('.btn-apply-page-order').removeClass ('hidden');
  });
  $ (newPage).find ('.btn-apply-page-order').click (function () {
    console.log ('Apply page Order');
    // show loading
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: addWorkingNote,
      args: 'apply page-order',
    });
    //addPage();
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: generateConfig,
      args: false,
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
    // hide loading
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: removeWorkingNote,
      args: null,
    });
    // generateConfig(false);
    // generatePages();
  });
  $ (newPage)
    .find ('input.page-title')
    .focus (function () {
      $ (this).select ();
    })
    .mouseup (function (e) {
      e.preventDefault ();
    })
    .keyup (function () {
      $ ('a[href="#' + uuid + '"] .page-title').text ($ (this).val ());
      //console.log($(this).val());
    });

  $ ('#pages .tab-content').append (newPage);

  $ ('#' + uuid + ' .btn-page-delete').click (function () {
    var uuid = $ (this).parent ().parent ().attr ('id');
    $ (".nav-link[href='#" + uuid + "'")
      .parent ()
      .parent ()
      .parent ()
      .remove ();
    $ (this).parent ().parent ().remove ();
    $ ('.menu-link-page').first ().click ();
    renamePages ();
  });

  $ ('#' + uuid + ' .btn-page-copy').click (function () {
    console.log ('.btn-page-copy');
    var uuid = $ (this).parent ().parent ().attr ('id');
    copyPage (uuid);
  });

  function copyPage (uuid) {
    // show loading
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: addWorkingNote,
      args: 'copy page',
    });
    //addPage();
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: generateConfig,
      args: false,
    });
    //addPage();
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: duplicatePageinConfig,
      args: uuid,
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
    // hide loading
    state.workingBuffer.push ({
      jobUUID: UUID (),
      jobfunction: removeWorkingNote,
      args: null,
    });
    // generateConfig(false);
    // duplicatePageinConfig(uuid);
    // generatePages();
  }

  // remove active class page-tab
  $ ('.page-nav-item.active').removeClass ('active');
  // now add page-tab
  var newPageTab = $ (state.templates.pageTab);
  console.log ('New pageTab with ' + uuid);
  $ (newPageTab).attr ('data-id', uuid).find ('a').attr ('href', '#' + uuid);
  //.addClass("active");
  $ (newPageTab).find ('.page-order').text (pageOrder);
  $ (newPageTab).find ('a').click (function () {
    $ ('#css').hide ();
    $ ('#theme').hide ();
    $ ('#bannerData').hide ();
    $ ('#imExportSection').hide ();
    $ ('.page').hide ();
    loadWidgets (uuid);
    $ ('#' + uuid).show (100);
  });

  $ (newPageTab).find ('a').click (function () {
    $ ('#css').hide ();
    $ ('#theme').hide ();
    $ ('#bannerData').hide ();
    $ ('#imExportSection').hide ();
    $ ('.page').hide ();
    $ ('.widget-holder').removeClass ('active');
    $ ('#' + uuid + ' .widget-holder').addClass ('active');
    $ ('#' + uuid).show (100);
  });

  $ (newPageTab)
    .find ('.nav-icon')
    .removeClass ()
    .addClass (pageIconFamily + ' nav-icon ' + pageIcon);

  if (pageIsStartpage) {
    $ (newPageTab)
      .find ('.nav-startpage-icon')
      .removeClass ('visibilty-hidden');
  }

  $ (newPageTab).find ('.page-title').text (pageTitle);
  $ (newPageTab).insertBefore ('#pages-nav-item-end');
  $ ('.page').hide ();
  $ ('.widget-holder').removeClass ('active');
  $ ('#' + uuid + ' .widget-holder').addClass ('active');
  $ ('#' + uuid).show (100);

  // prevent ENTER
  $ ('input').keydown (function (e) {
    if (e.keyCode == 13) {
      e.preventDefault ();
      return false;
    }
  });

  init_widget_dropdown (uuid);

  // gridOptions
  let gridOptions = {
    column: nbOfCols, // 6,12 or 18
    minRow: 1, // don't collapse when empty
    cellHeight: '67px',
    disableOneColumnMode: true,
    float: true,
    dragIn: false, // class that can be dragged from outside
    dragInOptions: {}, // clone
    dragOut: false,
    removable: false, // drag-out delete class
    removeTimeout: 100,
    resizable: {autoHide: true, handles: 'se,sw'},
    acceptWidgets: function (el) {
      return false;
    }, // function example, else can be simple: true | false | '.someClass' value
  };

  // #######################################################################################
  // INIT Grid
  // GridStack.addGrid expects a real HTMLElement (v13 API) - `[0]` unwraps
  // the jQuery collection; same DOM node either way, not a behavior change.
  state.grids[uuid] = GridStack.addGrid (
    $ ('#' + uuid + ' .grid-holder')[0],
    gridOptions
  );
  $ ('#' + uuid + ' .grid-holder .grid-stack').addClass (
    'grid-stack-' + nbOfCols
  );
  // console.log("################## GRID INIT");
  // console.log(grid);
  state.grids[uuid].on ('change', function (event, items) {
    // console.log(event);
    // console.log(items);
    items.forEach (function (item) {
      updateWidgetSize (item);
    });
  });
  state.grids[uuid].on ('added', function (event, items) {
    items.forEach (function (item) {
      updateWidgetSize (item);
    });
  });

  renamePages ();
  state.workBufferWorking = false;
  console.log ('finished addPage');
  // return uuid
  return uuid;
}

export function renamePages () {
  var pageNumber = 1;
  $ ('#pages .page').each (function () {
    var uuid = $ (this).attr ('id');
    var pageNumberText = 'Page'; // now page.order + pageNumber;
    //var pageNumberText = pageNumber;
    $ (this).find ('.label-page-name').text (pageNumberText);
    //console.log("Page "+ pageNumber);
    $ ('a[href="#' + uuid + '"]')
      .parent ()
      .parent ()
      .find ('.page-number')
      .val (pageNumber);
    pageNumber++;
  });
  var nbOfPages = $ ('#pages .label-page-name').length;

  if (nbOfPages < 2) {
    $ ('.btn-page-delete').hide ();
  } else {
    $ ('.btn-page-delete').show ();
  }
}

export function duplicatePageinConfig (uuid) {
  const appConfig = JSON.parse (localStorage.getItem ('appConfig', '{}'));
  let newPage = null;
  if (appConfig && appConfig.pages) {
    for (var page of appConfig.pages) { // (was implicit global)
      if (page.UUID === uuid) {
        // console.log(page);
        newPage = JSON.parse (JSON.stringify (page));
      }
    }
    newPage.UUID = UUID ();
    newPage.order = appConfig.pages.length + 1;

    for (var widget in newPage.widgets) { // (was implicit global)
      newPage.widgets[widget].UUID = UUID ();
      if (newPage.widgets[widget].type === 'card') {
        for (var cardWidget in newPage.widgets[widget].widgets) { // (was implicit global)
          newPage.widgets[widget].widgets[cardWidget].UUID = UUID ();
        }
      }
    }
    // console.log(newPage);
    appConfig.pages.push (newPage);
    localStorage.setItem ('appConfig', JSON.stringify (appConfig));
    state.workBufferWorking = false;
  }
}

export function initBannerData () {
  console.log ('init banner');
  var bannerDataTable = '<label for="table">select state for banner</label>'; // (was implicit global)
  bannerDataTable += "<table class='table table-dark'>";
  bannerDataTable += '<tr>';
  bannerDataTable +=
    '<td class="prop-name" data-html="true" data-placement="top" data-tooltip="tooltip">use banner</td>';
  bannerDataTable +=
    '<td class="prop-value"><div class="form-check"><input id="bannerUseBanner" type="checkbox" data-type="boolean" class="widget-prop form-control form-control-sm form-check type-boolean"/></div></td>';
  bannerDataTable += '</tr>';
  bannerDataTable += '<tr>';
  bannerDataTable +=
    '<td class="prop-name" data-html="true" data-placement="top" data-tooltip="tooltip" data-tooltip="">stateId</td>';
  bannerDataTable +=
    '<td class="prop-value"><select id="bannerStateId" class="widget-prop form-control form-control-sm  type-stateId prop-stateId"';
  bannerDataTable +=
    ' type="text" placeholder="stateId" data-prop="stateId" data-type="stateId" title="no state selected" data-toggle="modal" data-target="#selectModal"';
  bannerDataTable += ' data-select="stateSelect" value="no state selected">';
  bannerDataTable +=
    '<option selected="selected" value="no state selected">no state selected</option></select></td>';
  bannerDataTable += '</tr>';
  bannerDataTable += '<tr>';
  bannerDataTable +=
    '<td class="prop-name" data-html="true" data-placement="top" data-tooltip="tooltip" data-tooltip="type of state">stateIdType</td>';
  bannerDataTable +=
    '<td class="prop-value"><input id="bannerStateIdType" type="text" data-prop="stateIdType" data-type="stateIdType" title="none" class="widget-prop form-control form-control-sm stateIdType prop-stateIdType"';
  bannerDataTable +=
    ' placeholder="stateIdType" value="NONE" disabled="disabled" data-stateidtype="NONE"><hr class="widget-inline-seperator"><div class="newlinespacer"></div></td>';
  bannerDataTable += '<tr>';
  bannerDataTable += '</table>';
  $ (bannerDataTable).appendTo ('#bannerData');
}
