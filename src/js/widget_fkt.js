/**
 * Widget CRUD in the page editor: the "add widget" dropdown, the
 * property-editor form builder (createWidgetFormByPropType - one HTML
 * string per widget property type: string/number/color/boolean/icon/
 * stateId/momentjs/numeraljs/pageList/array/...), copy/paste/delete, and
 * the GridStack wiring for card-widgets (a card is itself a mini nested
 * grid). Converted to an ES module (2026-08 migration) - logic unchanged,
 * see helper_fkt.js's file header for the general conversion approach
 * (state.js for shared state, window-exposure shim for inline HTML
 * handlers, explicit declarations for previously-implicit globals).
 */
import $ from 'jquery';
import moment from 'moment';
import numeral from 'numeral';
import { GridStack } from 'gridstack';
import { state } from './state.js';
import { UUID } from '../vendor/uuid-v4.js';
import { widgetJSON } from './widgetJSON.js';
import { readWidgetConfig } from './helper_fkt.js';

export function init_widget_dropdown(targetUUID, card = false) {
  var widgetDropdown = `
	<div class="dropdown widget-dropdown ml-3" data-toggle="dropdown">
	  <button class="btn btn-sm btn-primary dropdown-toggle" type="button">
	  	<span class="btn-label"><i class="fas fa-plus"></i></span>
		Add Widget
	  </button>
	  <div class="dropdown-menu">
	  </div>
	</div>
  `;
  var widgetDropdownOption = `<a class="dropdown-item" href="#">OptionText</a>`;

  var widgetId = 'wg-' + targetUUID;

  $(widgetDropdown)
    .attr('id', widgetId)
    .appendTo('#' + targetUUID + ' .widget-dropdown-holder');

  for (var widget in widgetJSON) {
    // do not add Card in card
    if (card === true && widgetJSON[widget].type === 'card') {
      continue;
    }
    // do not add arrayitems
    if (widgetJSON[widget].type === 'arrayItem') {
      continue;
    }

    //console.log(widget);
    $(widgetDropdownOption)
      .text(widgetJSON[widget].type)
      .attr('data-widgetName', widgetJSON[widget].type)
      .attr('data-targetUUID', targetUUID)
      .attr('data-target', targetUUID)
      .click(function () {
        addWidgetToPage(
          $(this).attr('data-widgetName'),
          $(this).attr('data-targetUUID'),
          null,
          state.grids[targetUUID],
          card
        );
      })
      .appendTo('#' + widgetId + ' .dropdown-menu');
  }
  $('#' + widgetId).dropdown();
}

export function showPropsTable(uuid, gridstackNode) {
  if (gridstackNode) {
    // console.log("Position: " + gridstackNode.x + ":" + gridstackNode.y);
    $('.sidebar-settings-table').hide();
    $('.widget-settings-table').hide();
    $('#propsTable-' + uuid).show();
    $('#propsTable-' + uuid + ' .widget-settings-table').show();
    $('#props-' + uuid).show();
  }
}

export function init_widget_settings_form(widgettype, uuid) {
  var settingTableHeight = $(window).height() - 150;

  var widget_settings_form =
    `<table id="props-` +
    uuid +
    `"class="table table-striped widget-settings-table" data-toggle="table" data-height="` +
    settingTableHeight +
    `">`;

  widget_settings_form += `<thead><tr><th>Property</th><th>value</th></tr></thead>`;

  // Type
  widget_settings_form += `<tr><td class="prop-name">`;
  widget_settings_form += `type`;
  widget_settings_form +=
    `</td><td class="prop-widgettype" data-widgettype="` + widgettype + `" >`;
  widget_settings_form += widgettype;
  widget_settings_form += `</td></tr>`;
  // UUID
  widget_settings_form += `<tr><td class="prop-name">`;
  widget_settings_form += `UUID`;
  widget_settings_form +=
    `</td><td class="prop-uuid" data-uuid="` + uuid + `">`;
  widget_settings_form += uuid;
  widget_settings_form += `</td></tr>`;

  let key = 0; // no array key
  for (var prop in widgetJSON[widgettype]) { // (was implicit global)
    widget_settings_form += createWidgetFormByPropType(
      widgetJSON,
      widgettype,
      prop,
      key,
      uuid
    );
  }
  widget_settings_form += `</table>`;

  return widget_settings_form;
}

// Exposed on window: called from inline onchange="checkLinkReference(this, '<uuid>')"
// markup built in createWidgetFormByPropType() below (the 'string'
// property-type case, for the linkReference prop specifically).
export function checkLinkReference(element, uuid) {
  console.log('checkLinkReference');
  //console.log ($ (element));
  let elemId = $(element)[0].id;
  //console.log (elemId);
  // sanitize strLinkReferenceing
  let strLinkReference = $('#' + elemId).val();
  //console.log (strLinkReference);
  strLinkReference = strLinkReference.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, '');
  strLinkReference = strLinkReference.trim();
  strLinkReference = strLinkReference.replace(/ /g, '_');
  console.log(strLinkReference);
  $('#' + elemId).val(strLinkReference);
  // write string in data of parent-page
  let pageLinkReferences = $('#' + uuid)
    .closest('.page')
    .attr('data-linkreferences');
  let arrPageLinkReferences = [];
  if (pageLinkReferences) {
    arrPageLinkReferences = pageLinkReferences.split(' ');
  }
  arrPageLinkReferences.push(strLinkReference);
  $('#' + uuid)
    .closest('.page')
    .attr('data-linkreferences', arrPageLinkReferences.join(' '));
}

// `uuid` (used below to wire onChangeFkt for 'string'/'pageList' props back
// to the right widget) is an explicit parameter here, threaded through from
// init_widget_settings_form and the recursive array-handling call below.
// Originally it was an *implicit global* - set (also implicitly) by
// addWidgetToPage() right before this function ran, and silently read here
// via the shared global scope. Giving addWidgetToPage's `uuid` a real `var`
// during the ES-module conversion correctly scoped it to that function -
// which broke this function's hidden dependency on it. Passing it as a
// real parameter is the correct fix, not a scoping workaround.
export function createWidgetFormByPropType(widgetJSON, widgettype, prop, key, uuid) {
  //console.log("createWidgetFormByPropType: " + widgettype);
  var widget_settings_form = '';

  //widget_settings_form += prop + " :: " + widgetJSON[widgettype][prop];
  //console.log ('createWidgetFormByPropType: prop: ' + prop);

  if (prop !== 'type') {
    var formInput = '';
    var inputUUID = UUID();
    var objProp = widgetJSON[widgettype][prop];

    // handle array
    if (objProp && objProp.type && objProp.type === 'array') {
      // array has items, so count up
      for (let key = 1; key < objProp.maxItems + 1; key++) {
        for (prop in widgetJSON[objProp.items]) { // reassigns the `prop` parameter - matches original
          widget_settings_form += createWidgetFormByPropType(
            widgetJSON,
            objProp.items,
            prop,
            key,
            uuid
          );
        }
      }
      return widget_settings_form;
    }

    // console.log(prop);
    // console.log(objProp);
    // console.log("createWidgetFormByPropType: " + objProp.type);

    //handle array keys
    let arrayclass = '';
    let itemOfArraySpan = '';
    let arrayWidgetType = 'no-array';
    if (key > 0) {
      arrayclass = 'in-array ' + widgettype;
      itemOfArraySpan = `<span class="itemofarrayspan">${widgettype} ${key}: </span>`;
      arrayWidgetType = widgettype;
    }

    let onChangeFkt; // (was implicit global, shared by the 'string' and 'pageList' cases below)

    switch (objProp.type) {
      case 'file':
        formInput +=
          `<select id="` +
          inputUUID +
          `"
                          class="widget-prop form-control form-control-sm  type-file prop-` +
          prop +
          `"
                          type="text"
                          placeholder="` +
          prop +
          `"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          data-toggle="modal"
                          data-target="#selectModal"
                          data-select="fileSelect"
                          value="` +
          objProp.default +
          `"
                          >
                          <option selected="selected" value="` +
          objProp.default +
          `">` +
          objProp.default +
          `</option>
                          </select>`;
        break;
      case 'icon':
        formInput +=
          `<button id="` +
          inputUUID +
          `"
                          class="widget-prop btn btn-light btn-sm icon-select iconSelect type-icon prop-` +
          prop +
          `"
                          type="button"
                          title="` +
          objProp.default +
          `"
                          data-toggle="modal"
                          data-target="#selectModal"
                          data-select="iconSelect"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          value="` +
          objProp.default +
          `" type="text">
                            <i class="mfd-icon ` +
          objProp.default +
          `"></i>
                        </button>`;
        break;
      case 'iconFamily':
        formInput +=
          `<input id="` +
          inputUUID +
          `"
                          type="text"
                          title="` +
          objProp.default +
          `"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          value="` +
          objProp.default +
          `"
                          disabled="disabled"
                          class="widget-prop form-control form-control-sm type-iconFamily iconFamily prop-` +
          prop +
          `">`;
        break;
      case 'stateId':
        formInput +=
          `<select id="` +
          inputUUID +
          `"
                          class="widget-prop form-control form-control-sm  type-stateId prop-` +
          prop +
          `"
                          type="text"
                          placeholder="` +
          prop +
          `"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          data-toggle="modal"
                          data-target="#selectModal"
                          data-select="stateSelect"
                          value="` +
          objProp.default +
          `"
                          >
                          <option selected="selected" value="` +
          objProp.default +
          `">` +
          objProp.default +
          `</option>
                          </select>`;

        break;
      case 'stateIdType':
        formInput +=
          `<input id="` +
          inputUUID +
          `" type="text"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          class="widget-prop form-control form-control-sm ` +
          prop +
          ` prop-` +
          prop +
          `"
                          placeholder="` +
          prop +
          `"
                          value="` +
          objProp.default +
          `"
                          disabled="disabled">`;
        break;
      case 'string':
        onChangeFkt = 'return true;';
        if (prop === 'linkReference') {
          onChangeFkt = "checkLinkReference(this, '" + uuid + "');";
        }
        if (prop === 'title' || prop === 'url') {
          onChangeFkt =
            "$('#" +
            uuid +
            " .info').text($(this)[0].value).removeClass('danger');";
        }
        formInput +=
          `<input id="` +
          inputUUID +
          `" type="text"
                          onChange="` +
          onChangeFkt +
          `"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          class="widget-prop form-control form-control-sm type-string prop-` +
          prop +
          `"
                          placeholder="` +
          prop +
          `"
                          value="` +
          objProp.default +
          `" >`;
        break;
      case 'number':
        var min = '';
        if (objProp.min !== null && objProp.min !== undefined) {
          min = ` min="` + objProp.min + `" `;
        }
        var max = '';
        if (objProp.max) {
          max = ` max="` + objProp.max + `" `;
        }

        formInput +=
          `<input id="` +
          inputUUID +
          `" type="number"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          ` +
          min +
          max +
          `
                          class="widget-prop form-control form-control-sm type-number prop-` +
          prop +
          `"
                          placeholder="` +
          prop +
          `"
                          value="` +
          objProp.default +
          `" >`;
        break;
      case 'color':
        formInput +=
          `<input id="` +
          inputUUID +
          `" type="color"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          class="widget-prop form-control form-control-sm colorInput type-color prop-` +
          prop +
          `"
                          value="` +
          objProp.default +
          `" >`;
        break;
      case 'boolean':
        formInput +=
          `<input id="` +
          inputUUID +
          `" type="checkbox"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          class="widget-prop form-control form-control-sm form-check ml-1 mr-1 type-boolean prop-` +
          prop +
          `"
                          value="` +
          objProp.default +
          `"
                          onchange="updateBooleanProp(this)"
                          >`;
        break;
      case 'momentjs':
        formInput +=
          `<input id="` +
          inputUUID +
          `" type="text"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          class="widget-prop form-control form-control-sm nothidden momentjs type-momentjs prop-` +
          prop +
          `"
                          placeholder="` +
          prop +
          `"
                          value="` +
          objProp.default +
          `"
                          onkeyup="validateTimePickerFormat(this)" >
                          <span class="formatExample nothidden">Example: ` +
          moment().format(objProp.default) +
          `</span>`;
        break;
      case 'numeraljs':
        formInput +=
          `<input id="` +
          inputUUID +
          `" type="text"
                          data-prop="` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          class="widget-prop form-control form-control-sm numeraljs type-numeraljs prop-` +
          prop +
          `"
                          placeholder="` +
          prop +
          `"
                          value="` +
          objProp.default +
          `"  >`;
        break;
      case 'colorFormat':
        formInput += ``; // TODO
        break;
      case 'pageList':
        onChangeFkt =
          "$('#" +
          uuid +
          " .info').text($(this)[0].value).removeClass('danger');";
        formInput +=
          `<select id="` +
          inputUUID +
          `"
                          class="widget-prop form-control form-control-sm  type-pageList prop-` +
          prop +
          `"
                          data-arraykey="` +
          key +
          `"
                          data-arraytype="` +
          arrayWidgetType +
          `"
                          type="text"
                          placeholder="` +
          prop +
          `"
                          data-prop="` +
          prop +
          `"
                          data-type="` +
          objProp.type +
          `"
                          title="` +
          objProp.default +
          `"
                          value="` +
          objProp.default +
          `"
                          onchange="` +
          onChangeFkt +
          `"
                          onfocus="buildPageLinksSelect(this)"
                          >
                          <option selected="selected" value="` +
          objProp.default +
          `">` +
          objProp.default +
          `</option>
                          </select>`;
        break;

      default:
        //formInput += `<input type="number" class="form-control" placeholder="`;
        formInput += prop + ' ?????????????????????';
        // formInput += `">`;
        break;
    }
    // seperator after prop
    if (prop == 'stateIdType' || prop == 'url') {
      formInput += `<hr class="widget-inline-seperator"><div class="newlinespacer"></div>`;
    }
    // seperator before prop
    if (prop == 'area1Name' || prop == 'showAsIndicator') {
      formInput =
        `<hr class="widget-inline-seperator"><div class="newlinespacer"></div>` +
        formInput;
    }

    widget_settings_form +=
      `<tr class="` +
      arrayclass +
      `"><td
                                      class="prop-name"
                                      data-tooltip="tooltip"
                                      data-placement="top"
                                      data-html="true"
                                      title="` +
      objProp.tooltip +
      `"
                              >`;
    widget_settings_form += itemOfArraySpan + prop;
    widget_settings_form += `</td><td class="prop-value">`;

    widget_settings_form += formInput;

    widget_settings_form += `</td></tr>`;
  }
  //console.log("createWidgetFormByPropType return: " + widget_settings_form);
  return widget_settings_form;
}

// Exposed on window: called from inline onfocus="buildPageLinksSelect(this)"
// markup in the 'pageList' property-type case above.
export function buildPageLinksSelect(element) {
  let options = '';
  let value = $(element).val();
  $('.page .page-title').each(function () {
    console.log(this);
    let selected = ''; // (was implicit global)
    if ($(this).val() == value) {
      selected = "selected='selected'";
    }
    options +=
      '<option ' +
      selected +
      " value='" +
      $(this).val() +
      "'>" +
      $(this).val() +
      '</option>';
  });
  $('.page').each(function () {
    //console.log (this);
    let linkReferences = $(this).attr('data-linkreferences');
    if (linkReferences) {
      let arrLinkReferences = linkReferences.split(' ');
      $.each(arrLinkReferences, function (index, linkReference) {
        let selected = ''; // (was implicit global)
        if (linkReference == value) {
          selected = "selected='selected'";
        }
        options +=
          '<option ' +
          selected +
          " value='" +
          "ref@" + linkReference +
          "'>" +
          "ref@" + linkReference +
          '</option>';
      });
    }
  });
  $(element).html('');
  $(element).html(options);
}

// Exposed on window: called from inline onclick="deleteWidget(this,'<uuid>','<pageUUID>');"
// markup built in addWidgetToPage() below.
export function deleteWidget(element, uuid, pageUUID) {
  if (!e) var e = window.event;
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  console.log('delete Item');
  // console.log(document.getElementById(uuid).parentElement.parentElement);
  state.grids[pageUUID].removeWidget(
    document.getElementById(uuid).parentElement.parentElement
  );
  state.grids[pageUUID].update();
}

// Exposed on window: called from inline onclick="copyWidget(this,'<uuid>','<targetUUID>','<card>');"
// markup built in addWidgetToPage() below.
export function copyWidget(element, uuid, targetUUID, card) {
  if (!e) var e = window.event;
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  //read settings
  var widgetData = readWidgetConfig(uuid);

  // is card
  if (card === true || card === 'true') {
    // copy within card
    //create newUUID
    widgetData.UUID = UUID();
    // add to Page
    addWidgetToPage(
      widgetData.type,
      targetUUID,
      widgetData,
      state.grids[targetUUID],
      card,
      true
    );
  } else {

    // store widgetData for paste
    state.copiedWidgetdata = widgetData;

    if (state.copiedWidgetdata.UUID) {
      $("#widgetClipboard").removeClass("hidden");
      $("#widgetClipboard .buttontext").text("paste widget '" + state.copiedWidgetdata.type + "' to active page");
    }
  }


}

$("#btn-paste-clipboard-widget").click(function () { pasteWidget() });


export function pasteWidget() {
  let targetUUID = $(".page:visible").attr("id");
  let widgetData = state.copiedWidgetdata;
  if (widgetData.UUID && targetUUID) {
    //create newUUID
    widgetData.UUID = UUID();
    // add to Page
    addWidgetToPage(
      widgetData.type,
      targetUUID,
      widgetData,
      state.grids[targetUUID],
      false,
      true
    );
  }

}

// Exposed on window: called from inline onchange="updateBooleanProp(this)"
// markup in the 'boolean' property-type case above.
export function updateBooleanProp(element) {
  $(element).val($(element)[0].checked);
}

// Exposed on window: called from inline onclick="selectWidget(this,'<uuid>');"
// markup built in addWidgetToPage() below.
export function selectWidget(element, UUID) {
  // console.log($(element).closest(".grid-stack-item")[0].gridstackNode.x);
  // console.log($(element).closest(".grid-stack-item")[0].gridstackNode.y);
  if (!e) var e = window.event;
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();

  $('.grid-stack-item-content.selected').removeClass('selected');
  $(element).parent().addClass('selected');
  showPropsTable(
    UUID,
    $(element).closest('.grid-stack-item')[0].gridstackNode
  );
}

export function updateWidgetSize(item) {
  // update width and height
  // console.log(item);
  // console.log($("#props-" + item.uuid + " .prop-widgetPosX"));
  $('#props-' + item.uuid + ' .prop-widgetPosX').val(item.x);
  $('#props-' + item.uuid + ' .prop-widgetPosX').attr('value', item.x);
  $('#props-' + item.uuid + ' .prop-widgetPosX').attr(
    'data-widgetPosX',
    item.x
  );
  $('#props-' + item.uuid + ' .prop-widgetPosY').val(item.y);
  $('#props-' + item.uuid + ' .prop-widgetPosY').attr('value', item.y);
  $('#props-' + item.uuid + ' .prop-widgetPosY').attr(
    'data-widgetPosY',
    item.y
  );

  $('#props-' + item.uuid + ' .prop-widgetHeight').val(item.h);
  $('#props-' + item.uuid + ' .prop-widgetHeight').attr('value', item.h);
  $('#props-' + item.uuid + ' .prop-widgetHeight').attr(
    'data-widgetHeight',
    item.h
  );
  $('#props-' + item.uuid + ' .prop-widgetWidth').val(item.w);
  $('#props-' + item.uuid + ' .prop-widgetWidth').attr('value', item.w);
  $('#props-' + item.uuid + ' .prop-widgetWidth').attr(
    'data-widgetWidth',
    item.w
  );

  $('.grid-stack-item-content.selected').removeClass('selected');
  $('#' + item.uuid).parent().addClass('selected');
  showPropsTable(item.uuid, item);
}

export function handleCardWidget(widgetUUID, nbOfCols = 18) {
  $('#' + widgetUUID).append(
    "<div class='widgetcard widget-dropdown-holder'></div><div class='widgetcard widget-holder'><div class='grid-holder'></div></div>"
  );

  // gridOptions
  let gridOptions = {
    column: nbOfCols, // 6,12 or 18
    minRow: 1, // don't collapse when empty
    cellHeight: '67px', //"67px",
    disableOneColumnMode: true,
    float: true,
    dragIn: false, // class that can be dragged from outside
    dragOut: false,
    dragInOptions: {}, // clone
    removable: false, // drag-out delete class
    removeTimeout: 100,
    resizable: { autoHide: true, handles: 'se,sw' },
    acceptWidgets: function (el) {
      return false;
    }, // function example, else can be simple: true | false | '.someClass' value
  };

  // #######################################################################################
  // INIT Grid
  // GridStack.addGrid expects a real HTMLElement (v13 API) - `[0]` unwraps
  // the jQuery collection; same DOM node either way, not a behavior change.
  state.grids[widgetUUID] = GridStack.addGrid(
    $('#' + widgetUUID + ' .grid-holder')[0],
    gridOptions
  );
  $('#' + widgetUUID + ' .grid-holder .grid-stack').addClass(
    'grid-stack-' + nbOfCols
  );
  // console.log("################## GRID INIT");

  // console.log(widgetUUID);
  // console.log(grids[widgetUUID]);
  state.grids[widgetUUID].on('change', function (event, items) {
    // console.log(event);
    // console.log(items);
    items.forEach(function (item) {
      updateWidgetSize(item);
    });
  });
  state.grids[widgetUUID].on('added', function (event, items) {
    items.forEach(function (item) {
      updateWidgetSize(item);
    });
  });

  init_widget_dropdown(widgetUUID, true);

  // grid= grids[widgetUUID];
  // grid.addWidget({ w: 2, h: 2, x: 1, y: 1, maxH: 10, content: "content", uuid: "uuid" });

  return widgetUUID;
}

export function addWidgetToPage(
  widget,
  targetUUID,
  widgetData = null,
  grid,
  card = false,
  copy = false
) {
  console.log(widget);
  console.log(widgetData);
  console.log(targetUUID);
  console.log(grid);

  // filler is now headline
  if (widget === 'filler') {
    widget = 'headline';
  }

  widgetData = widgetData || {};

  var uuid = widgetData.UUID || UUID(); // (was implicit global)

  // info-text to Widgets
  var widgetInfo = ''; // (was implicit global)
  if (widget !== 'card') {
    if (widgetJSON[widget].stateId) {
      widgetInfo = widgetData.stateId || widgetJSON[widget].stateId.default;
    } else if (widgetJSON[widget].title) {
      widgetInfo = widgetData.title || widgetJSON[widget].title.default;
    } else if (widgetJSON[widget].url) {
      widgetInfo = widgetData.url || widgetJSON[widget].url.default;
    } else if (widgetJSON[widget].targetpage) {
      widgetInfo =
        widgetData.targetpage || widgetJSON[widget].targetpage.default;
    }
  }
  $('#' + uuid + ' .info').text(widgetInfo);
  $('#' + uuid + ' .info').attr('title', widgetInfo);

  var widgetInfoClass = ''; // (was implicit global)
  if (
    widgetInfo === 'undefined' ||
    widgetInfo === 'no state selected' ||
    widgetInfo === 'startpage'
  ) {
    widgetInfoClass = 'danger';
  }

  var targetClass = 'pageWidget'; // (was implicit global)
  if (card === true || card === 'true') {
    targetClass = 'cardWidget';
  }

  if (widgetJSON[widget]) {
    var content = ``;
    content +=
      `<div class="grid-widget ` +
      targetClass +
      ` ` +
      widget +
      `" id="` +
      uuid +
      `" onclick="selectWidget(this,'` +
      uuid +
      `');"><div class="type" title="` +
      widget +
      `">` +
      widget +
      `</div>`;
    content +=
      `<div class="info ` +
      widgetInfoClass +
      `" title="` +
      widgetInfo +
      `">` +
      widgetInfo +
      `</div>`;
    content += `<span class="link-holder">`;
    content +=
      `<a href="#" class="link-copy-widget" title="copy widget" onclick="copyWidget(this,'` +
      uuid +
      `','` +
      targetUUID +
      `','` +
      card +
      `');return false;"><i class="fa fa-copy"></i></a>`;
    content +=
      `<a href="#" class="link-delete-widget" title="delete widget" onclick="deleteWidget(this,'` +
      uuid +
      `','` +
      targetUUID +
      `');return false;"><i class="far fa-trash-alt"></i></a>`;
    content += `</span>`;
    content += `</div>`;

    // check for width and height
    if (!widgetData.widgetHeight) {
      widgetData.widgetHeight = 1;
      if (widget === 'card') {
        widgetData.widgetHeight = 3;
      }
    }
    if (!widgetData.widgetWidth) {
      widgetData.widgetWidth = 6;
    }
    let widgetMinHeight = 1;
    if (widget === 'card') {
      widgetMinHeight = 1; //2
    }
    let widgetMinWidth = 1;
    if (widget === 'card') {
      widgetMinWidth = 1; //6
    }

    // NOTE: init_widget_settings_form only takes (widgettype, uuid) - the
    // 3rd arg here is silently dropped by JS (pre-existing, not a bug
    // introduced by this migration; left as-is per "no behavior change").
    var newWidgetSettings = init_widget_settings_form(
      widget,
      uuid,
      widgetData
    );
    $('#settings-holder').append($(newWidgetSettings));

    //add to grid
    grid.addWidget({
      w: widgetData.widgetWidth,
      h: widgetData.widgetHeight,
      x: widgetData.widgetPosX,
      y: widgetData.widgetPosY,
      minH: widgetMinHeight,
      maxH: 100,
      minW: widgetMinWidth,
      content: content,
      uuid: uuid,
    });

    for (var data in widgetData) { // (was implicit global)
      // console.log("widgetdata");
      //console.log(data);
      // console.log(widgetData);
      // console.log(uuid);

      // handle array-data of widgets
      if (data.startsWith('array_')) {
        for (var key in widgetData[data]) { // (was implicit global)
          for (var prop in widgetData[data][key]) { // (was implicit global)
            console.log(prop + ': ' + widgetData[data][key][prop]);
            $(
              '#props-' +
              uuid +
              ' .prop-' +
              prop +
              '[data-arraykey="' +
              key +
              '"]'
            ).val(widgetData[data][key][prop]);
            $(
              '#props-' +
              uuid +
              ' .prop-' +
              prop +
              '[data-arraykey="' +
              key +
              '"]'
            ).attr('value', widgetData[data][key][prop]);
            $(
              '#props-' +
              uuid +
              ' .prop-' +
              prop +
              '[data-arraykey="' +
              key +
              '"]'
            ).attr('data-' + prop, widgetData[data][key][prop]);
          }
        }
      } else {
        $('#props-' + uuid + ' .prop-' + data).val(widgetData[data]);
        $('#props-' + uuid + ' .prop-' + data).attr(
          'value',
          widgetData[data]
        );
        $('#props-' + uuid + ' .prop-' + data).attr(
          'data-' + data,
          widgetData[data]
        );
      }
    }

    // disable input of width and height
    $('#props-' + uuid + ' .prop-widgetHeight').attr('disabled', 'disabled');
    $('#props-' + uuid + ' .prop-widgetWidth').attr('disabled', 'disabled');

    // add icon classes to i-Element
    var iconElements = $('#props-' + uuid + ' .type-icon i');
    iconElements.each(function () {
      $(this)
        .removeClass()
        .addClass($(this).parent().val())
        .addClass(
          $(this)
            .parent()
            .parent()
            .parent()
            .next()
            .find('.type-iconFamily')
            .val()
        );

      // console.log("######################################");
      // console.log($(this).parent().parent().parent().next().find(".type-iconFamily"));
    });
    // add stateId to state-Select
    var stateIdElements = $('#props-' + uuid + ' .type-stateId');
    stateIdElements.each(function () {
      //var stateId = $(this).attr('data-stateid');
      var stateId = $(this).attr('value');
      $(this).find('option').remove();
      $(this).append(
        $(
          '<option selected="selected" value="' +
          stateId +
          '">' +
          stateId +
          '</option>'
        )
      );
    });
    // add checked to boolean
    var booleanElements = $('#props-' + uuid + ' .type-boolean');
    booleanElements.each(function () {
      var value = $(this).val();
      if (value == 'true') {
        $(this).attr('checked', 'checked');
      } else {
        $(this).removeAttr('checked');
      }
    });
    // add file to file-Select
    var fileElements = $('#props-' + uuid + ' .type-file');
    fileElements.each(function () {
      var value = $(this).attr('value');
      $(this).find('option').remove();
      $(this).append(
        $(
          '<option selected="selected" value="' +
          value +
          '">' +
          value +
          '</option>'
        )
      );
    });
    // add targetpage to pageList
    var pageListElements = $('#props-' + uuid + ' .type-pageList');
    pageListElements.each(function () {
      var pageLink = $(this).attr('value');
      $(this).find('option').remove();
      $(this).append(
        $(
          '<option selected="selected" value="' +
          pageLink +
          '">' +
          pageLink +
          '</option>'
        )
      );
    });

    $('#props-' + uuid).bootstrapTable();

    $('#props-' + uuid + ' .tooltip').remove();
    $('#props-' + uuid + ' [data-tooltip="tooltip"]').tooltip();

    $('#props-' + uuid)
      .closest('.bootstrap-table')
      .attr('id', 'propsTable-' + uuid)
      .addClass('sidebar-settings-table')
      .hide();
  }

  if (widget === 'card') {
    let cardUUID = handleCardWidget(uuid);
    console.log('handleCardWidget returned: ' + cardUUID);
    console.log(widgetData);
    if (copy === true) {
      // `widget` here reassigns the outer `widget` parameter via `var`
      // (matches original - a pre-existing quirk, not fixed here).
      for (var widget in widgetData.widgets) {
        widgetData.widgets[widget].UUID = UUID();
        addWidgetToPage(
          widgetData.widgets[widget].type,
          cardUUID,
          widgetData.widgets[widget],
          state.grids[cardUUID],
          true
        );
      }
    }
  }

  return uuid;
}

// Exposed on window: called from inline onkeyup="validateTimePickerFormat(this)"
// markup in the 'momentjs' property-type case above.
export function validateTimePickerFormat(elem) {
  console.log('validateTimePickerFormat');
  let format = $(elem).val();
  console.log($(elem).next());
  let formatExample = moment().format(format);
  $(elem).next('.formatExample').text('Example: ' + formatExample);
}

// NOTE: correctly implemented but currently has zero callers anywhere in
// the app (not even inline - the 'numeraljs' property case above has no
// onkeyup handler wired to it, unlike the momentjs case). Pre-existing,
// left as-is; not added to the window-exposure block since nothing calls
// it by name today.
export function validateNumeralFormat(elem) {
  console.log('validateNumeralFormat');
  let format = $(elem).val();
  let formatExample = numeral(1000).format(format);
  $(elem)
    .parent()
    .parent()
    .parent()
    .find('.formatExample')
    .val(formatExample);
}

// Window-exposure compat shim - see helper_fkt.js file header for why this
// is needed. Deliberately excludes validateNumeralFormat (dead, see above)
// and the timeSwitch*/valueSwitcherSelectChange functions that were only
// ever referenced from the now-deleted, never-rendered dead widget
// templates (found and removed during this migration).
Object.assign(window, {
  checkLinkReference,
  buildPageLinksSelect,
  deleteWidget,
  copyWidget,
  updateBooleanProp,
  selectWidget,
  validateTimePickerFormat,
});
