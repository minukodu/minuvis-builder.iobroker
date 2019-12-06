// App
var variables = [];
var socket;
var showInfoText = false;
var filePath = "minukodu"

//var templates = getTemplates();
//console.log(templates);

var templates = {};

templates.widgets = [];

templates.configJSprePend = "const appConfig =";
templates.configJSpostPend = ";localStorage.setItem('appConfig', JSON.stringify(appConfig));";

templates.pageTab = `
  <li class="nav-item page-nav-item">
      <a href="#pageHome" class="nav-link menu-link-page">
          <i class="far fa-newspaper nav-icon"></i>
          <i class="fas fa-rocket nav-startpage-icon visibility-hidden"></i>
          <p>
              <span class="page-number">Page 1</span>
              <span class="page-separator"> - </span>
              <span class="page-title">PageName</span>
          </p>
      </a>
  </li>`;

templates.page = `
  <!-- page -->
  <div class="tab-pane page tinted nested-sortable" data-id="60248645-ca99-4c2c-8d14-b614665439ae"
  id="60248645-ca99-4c2c-8d14-b614665439ae">

  <!-- title ans startpage -->
  <form class="form-inline mb-3">
      <div class="input-group input-group-sm">
      <div class="input-group-prepend">
          <span class="input-group-text alert-info label-page-name">Page 1</span>
      </div>
      <input type="text" class="form-control  form-control-sm page-title" placeholder="Name of page"
          value="Page 1">
      </div>
      <div class="form-check ml-2">
      <input class="form-check-input isstartpage" type="checkbox">
      <label class="form-check-label">
          is Startpage
      </label>
      </div>
      <div class="form widget-dropdown-holder">
      </div>
      <!-- delete button -->
      <button type="button" class="btn btn-sm btn-labeled btn-outline-danger btn-page-delete mt-1"
      style="">
      <span class="btn-label"><i class="far fa-trash-alt"></i></span>
      delete Page
      </button>
  </form>

  <!-- widgets -->
  <div class="widget-holder">
      
      <div class="widget-holder-end" class="hidden"></div>
  </div>
  </div> <!-- /page -->
`;

templates.widgets["switch"] = `
<div class="card widget switch" data-widgettype="switch">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">Switch</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">Set title ...</strong>
  &nbsp;state:&nbsp;
  <strong class="settings-state">...</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="Set title ...">
    <small class="form-text text-muted hidden">NONE to hide title</small>
  </div>
</div>
<form>
  <div class="input-group mb-3">
    <input type="text" class="form-control stateSelect" disabled="disabled" placeholder="state">
    <div class="input-group-append">
      <button class="btn btn-primary" type="button" data-toggle="modal" data-target="#selectModal"
        data-select="stateSelect">select State</button>
    </div>
  </div>
</form>
</div> <!-- /card-body -->
</div>
`;


templates.widgets["indicator"] = `
<div class="card widget indicator" data-widgettype="indicator">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">Indicator</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">Set title ...</strong>
  &nbsp;icon:&nbsp;
  <strong class="settings-icon">it_wifi</strong>
  &nbsp;state:&nbsp;
  <strong class="settings-state">...</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="Set title ...">
    <small class="form-text text-muted hidden">NONE to hide title</small>
  </div>
</div>
<!-- icon, alarm, negate -->
<form class="form form-inline">
  <div class="form-group">
    <div class="input-group mb-3 iconSelect" data-icon="it_wifi">
        <div class="input-group-prepend">
            <span class="input-group-text"><i class="mfd-icon it_wifi"></i></span>
        </div>
        <div class="input-group-append">
          <button class="btn btn-primary" type="button" data-toggle="modal"
            data-target="#selectModal" data-select="iconSelect">
            select Icon
          </button>
        </div>
    </div>
  </div>
  <div class="form-group form-check ml-3">
    <input type="checkbox" class="form-check-input showasalarm">
    <label class="form-check-label">Show as Alarm</label>
  </div>
  <div class="form-group form-check ml-2">
    <input type="checkbox" class="form-check-input negate">
    <label class="form-check-label">negate signal</label>
  </div>
</form>
<form>
  <div class="input-group mb-3">
    <input type="text" class="form-control stateSelect" disabled="disabled" placeholder="state">
    <div class="input-group-append">
      <button class="btn btn-primary" type="button" data-toggle="modal" data-target="#selectModal"
        data-select="stateSelect">select State</button>
    </div>
  </div>
</form>
</div> <!-- /card-body -->
</div>
`;

templates.widgets["slider"] = `
<div class="card widget slider" data-widgettype="slider">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">Slider</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">Set title ...</strong>
  &nbsp;state:&nbsp;
  <strong class="settings-state">...</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="NONE">
    <small class="form-text text-muted hidden">NONE to hide title</small>
  </div>
</div>
<form>
  <div class="input-group input-group-sm mb-2">
  <div class="input-group-prepend">
      <span class="input-group-text alert-info">Minimum</span>
  </div>
  <input type="text" class="form-control  form-control-sm minimum" value="0">
</div>
<div class="input-group input-group-sm mb-2">
<div class="input-group-prepend">
    <span class="input-group-text alert-info">Maximum</span>
</div>
<input type="text" class="form-control  form-control-sm maximum" value="100">
</div>
<div class="input-group input-group-sm mb-2">
<div class="input-group-prepend">
    <span class="input-group-text alert-info">Step</span>
</div>
<input type="text" class="form-control  form-control-sm step" value="5">
</div>
<div class="input-group input-group-sm mb-2">
<div class="input-group-prepend">
    <span class="input-group-text alert-info">Unit</span>
</div>
<input type="text" class="form-control  form-control-sm unit" value="%">
</div>
</form>
<form>
  <div class="input-group mb-3">
    <input type="text" class="form-control stateSelect" disabled="disabled" placeholder="state">
    <div class="input-group-append">
      <button class="btn btn-primary" type="button" data-toggle="modal" data-target="#selectModal"
        data-select="stateSelect">select State</button>
    </div>
  </div>
</form>
</div> <!-- /card-body -->
</div>
`;

templates.widgets["output"] = `
<div class="card widget output" data-widgettype="output">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">Output</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">Set title ...</strong>
  &nbsp;state:&nbsp;
  <strong class="settings-state">...</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="NONE">
    <small class="form-text text-muted hidden">NONE to hide title</small>
  </div>
</div>
<form>
  <div class="input-group input-group-sm mb-2">
    <div class="input-group-prepend">
        <span class="input-group-text alert-info">Unit</span>
    </div>
    <input type="text" class="form-control  form-control-sm unit" value="%">
  </div>
</form>
<form>
  <div class="input-group mb-3">
    <input type="text" class="form-control stateSelect" disabled="disabled" placeholder="state">
    <div class="input-group-append">
      <button class="btn btn-primary" type="button" data-toggle="modal" data-target="#selectModal"
        data-select="stateSelect">select State</button>
    </div>
  </div>
</form>
</div> <!-- /card-body -->
</div>
`;

templates.widgets["html"] = `
<div class="card widget html" data-widgettype="html">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">Html</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">NONE</strong>
  &nbsp;state:&nbsp;
  <strong class="settings-state">...</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="NONE">
    <small class="form-text text-muted">NONE to hide title</small>
  </div>
</div>
<form>
  <div class="input-group mb-3">
    <input type="text" class="form-control stateSelect" disabled="disabled" placeholder="state">
    <div class="input-group-append">
      <button class="btn btn-primary" type="button" data-toggle="modal" data-target="#selectModal"
        data-select="stateSelect">select State</button>
    </div>
  </div>
</form>
</div> <!-- /card-body -->
</div>
`;

templates.widgets["iframe"] = `
<div class="card widget iframe" data-widgettype="iframe">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">IFrame</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">NONE</strong>
  &nbsp;url:&nbsp;
  <strong class="settings-url">https://iobroker.com</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="NONE">
    <small class="form-text text-muted">NONE to hide title</small>
  </div>
</div>
<form>
  <div class="input-group input-group-sm">
    <div class="input-group-prepend">
        <span class="input-group-text alert-info">URL</span>
    </div>
    <input type="url" class="form-control  form-control-sm url"
          placeholder="https://iobroker.com/" value="https://iobroker.com/" />
  </div>
  <div class="input-group input-group-sm mt-1">
    <div class="input-group-prepend">
        <span class="input-group-text alert-info ">Update-time in seconds</span>
    </div>
    <input type="text" class="form-control  form-control-sm updateTimeSek" value="600">
  </div>
  <div class="input-group input-group-sm mt-1">
  <div class="input-group-prepend">
      <span class="input-group-text alert-info ">width in px or %</span>
  </div>
  <input type="text" class="form-control  form-control-sm width" value="100%">
</div>
<div class="input-group input-group-sm mt-1">
<div class="input-group-prepend">
    <span class="input-group-text alert-info ">height in px or %</span>
</div>
<input type="text" class="form-control  form-control-sm height" value="600px">
</div>
</form>
</div> <!-- /card-body -->
</div>
`;

templates.widgets["imgoutput"] = `
<div class="card widget imgoutput" data-widgettype="imgoutput">
<div class="card-header">
<i class="fas fa-arrows-alt handle"></i>
<h5 class="card-title">ImgOutput</h5>
<small class="settings ml-4">title:&nbsp;
  <strong class="settings-title">NONE</strong>
  &nbsp;url:&nbsp;
  <strong class="settings-url">http://placekitten.com/640/360</strong>
  </small>
<div class="card-tools">
  <button type="button" class="btn btn-tool btn-widget-copy">
    <i class="fas fa-copy"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-collapse">
    <i class="fas fa-minus"></i>
  </button>
  <button type="button" class="btn btn-tool btn-widget-remove">
    <i class="fas fa-times"></i>
  </button>
</div><!-- /card-tools -->
</div><!-- /card-header -->
<div class="card-body">
<!-- title -->
<div class="widget-title-form form">
  <div class="form-group">
    <input type="text" class="form-control form-control-sm title" value="NONE">
    <small class="form-text text-muted">NONE to hide title</small>
  </div>
</div>
<form>
  <div class="input-group input-group-sm">
    <div class="input-group-prepend">
        <span class="input-group-text alert-info ">URL</span>
    </div>
    <input type="url" class="form-control  form-control-sm url"
          placeholder="http://placekitten.com/640/360" value="http://placekitten.com/640/360" />
  </div>
  <div class="input-group input-group-sm mt-1">
    <div class="input-group-prepend">
        <span class="input-group-text alert-info ">Update-time in seconds</span>
    </div>
    <input type="text" class="form-control  form-control-sm updateTimeSek" value="600">
  </div>
</form>
</div> <!-- /card-body -->
</div>
`;

templates.widgets["filler"] = `
<div class="card widget filler" data-widgettype="filler">
  <div class="card-header">
    <i class="fas fa-arrows-alt handle"></i>
    <h5 class="card-title">Filler</h5>
    <small class="settings ml-4">no extra settings</small>
    <div class="card-tools">
      <button type="button" class="btn btn-tool btn-widget-copy">
        <i class="fas fa-copy"></i>
      </button>
      <button type="button" class="visibility-hidden btn btn-tool btn-widget-collapse">
        <i class="fas fa-minus"></i>
      </button>
      <button type="button" class="btn btn-tool btn-widget-remove">
        <i class="fas fa-times"></i>
      </button>
    </div><!-- /card-tools -->
  </div>
</div>
`;


function generatePages() {
  // delete all pages
  $("#pages .page").remove();
  $(".menu-link-page").remove();

  const appConfig = JSON.parse(localStorage.getItem("appConfig", "{}"));
  console.log(appConfig);

  // Data Connection
  $("#data-url-port").val(appConfig.dataprovider.url);
  $("#data-url-port").attr("value", appConfig.dataprovider.url);


  for (var pageId in appConfig.pages) {
    var pageUUID = addPage(appConfig.pages[pageId]);
    //console.log(appConfig.pages[pageId]);
    for (var widgetId in appConfig.pages[pageId].widgets) {
      //console.log(appConfig.pages[pageId].widgets[widgetId]);
      var widget = appConfig.pages[pageId].widgets[widgetId];
      // console.log(widget.type);
      // console.log(pageUUID);
      var widgetUUID = addWidgetToPage(widget.type, pageUUID);
      populateWidget(widgetUUID, widget);

    }

  }
  $(".menu-link-page")
    .first()
    .click();
}

function populateWidget(widgetUUID, newWidget) {
  var thisWidget = $("#" + widgetUUID);
  switch (newWidget.type) {
    case "indicator":
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.stateSelect").val(newWidget.stateId);
      $(thisWidget).find(".settings-state").text(newWidget.stateId);
      $(thisWidget).find(".settings-icon").text(newWidget.icon);
      $(thisWidget).find(".iconSelect")
        .val(newWidget.icon)
        .attr("data-icon", newWidget.icon);
      $(thisWidget).find(".iconSelect i")
        .removeClass()
        .addClass("mfd-icon " + newWidget.icon);
      if (newWidget.additionalClass === "alarm") {
        $(thisWidget).find(".showasalarm")
          .attr("checked", "checked");
      }
      if (newWidget.negate === true) {
        $(thisWidget).find(".negate")
          .attr("checked", "checked");
      }
      break;
    case "switch":
      //console.log("add switch");
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.stateSelect").val(newWidget.stateId);
      $(thisWidget).find(".settings-state").text(newWidget.stateId);
      break;
    case "html":
      //console.log("add html");
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.stateSelect").val(newWidget.stateId);
      $(thisWidget).find(".settings-state").text(newWidget.stateId);
      break;
    case "slider":
      // console.log("add slider");
      // console.log($(thisWidget));
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.stateSelect").val(newWidget.stateId);
      $(thisWidget).find(".settings-state").text(newWidget.stateId);
      $(thisWidget).find("input.unit").val(newWidget.unit);
      $(thisWidget).find("input.minimum").val(newWidget.min);
      $(thisWidget).find("input.maximum").val(newWidget.max);
      $(thisWidget).find("input.step").val(newWidget.step);
      break;
    case "output":
      //console.log("add output");
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.stateSelect").val(newWidget.stateId);
      $(thisWidget).find(".settings-state").text(newWidget.stateId);
      $(thisWidget).find("input.unit").val(newWidget.unit);
      break;
    case "iframe":
      //console.log("add iframe");
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.url").val(newWidget.url);
      $(thisWidget).find(".settings-url").text(newWidget.url);
      $(thisWidget).find("input.updateTimeSek").val(newWidget.updateTimeSek);
      $(thisWidget).find("input.width").val(newWidget.width);
      $(thisWidget).find("input.height").val(newWidget.height);
      break;
    case "imgoutput":
      //console.log("add imgoutput");
      $(thisWidget).find("input.title").val(newWidget.title);
      $(thisWidget).find(".settings-title").text(newWidget.title);
      $(thisWidget).find("input.url").val(newWidget.url);
      $(thisWidget).find(".settings-url").text(newWidget.url);
      $(thisWidget).find("input.updateTimeSek").val(newWidget.updateTimeSek);
      break;
    default:
      // no more settings
      ;
  }
}

function generateConfig(saveInFile = true) {
  var newConfig = {};

  newConfig.timestamp = moment();

  newConfig.settings = {};
  newConfig.settings.LayoutDunkel = true;
  newConfig.settings.SplitterOpen = true;

  newConfig.dataprovider = {};
  newConfig.dataprovider.type = "iobroker";
  newConfig.dataprovider.url = $("#data-url-port").val();
  newConfig.dataprovider.fileName = $("#select-configfile").val() + ".json";

  if (newConfig.dataprovider.fileName.length < 1) {
    newConfig.dataprovider.fileName = "config_" + moment() + ".json";
  }
  if (newConfig.dataprovider.fileName.substring(newConfig.dataprovider.fileName.length - 5, newConfig.dataprovider.fileName.length) !== ".json") {
    newConfig.dataprovider.fileName = newConfig.dataprovider.fileName + ".json";
  }

  newConfig.pages = [];


  $("#pages .page").each(function () {
    var newPage = {};
    newPage.UUID = $(this).attr("id");
    newPage.title = $(this).find(".page-title").val();
    newPage.startpage = false;
    if ($(this).find(".isstartpage").get([0]).checked === true) {
      newPage.startpage = true;
    }
    // read widgets
    newPage.widgets = [];
    $(this).find(".widget-holder .widget").each(function () {
      newWidget = {};
      newWidget.UUID = $(this).attr("id");
      newWidget.type = $(this).data("widgettype");
      switch (newWidget.type) {
        case "indicator":
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.stateId = $(this).find("input.stateSelect").val() || "dummy.state";
          newWidget.icon = $(this).find(".iconSelect").attr("data-icon");
          newWidget.negate = false;
          if ($(this).find("input.negate").get([0]).checked === true) {
            newWidget.negate = true;
          }
          newWidget.additionalClass = "";
          if ($(this).find("input.showasalarm").get([0]).checked === true) {
            newWidget.additionalClass = "alarm"
          }
          break;
        case "switch":
          //console.log("add switch");
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.stateId = $(this).find("input.stateSelect").val() || "dummy.state";
          break;
        case "html":
          //console.log("add html");
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.stateId = $(this).find("input.stateSelect").val() || "dummy.state";
          break;
        case "slider":
          //console.log("add slider");
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.stateId = $(this).find("input.stateSelect").val() || "dummy.state";
          newWidget.unit = $(this).find("input.unit").val();
          newWidget.min = parseInt($(this).find("input.minimum").val(), 10) || 0;
          newWidget.max = parseInt($(this).find("input.maximum").val(), 10) || 100;
          newWidget.step = parseInt($(this).find("input.step").val(), 10) || 5;
          break;
        case "output":
          //console.log("add output");
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.stateId = $(this).find("input.stateSelect").val() || "dummy.state";
          newWidget.unit = $(this).find("input.unit").val();
          break;
        case "iframe":
          //console.log("add iframe");
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.url = $(this).find("input.url").val();
          newWidget.updateTimeSek = parseInt($(this).find("input.updateTimeSek").val(), 10) || 599;
          newWidget.width = $(this).find("input.width").val();
          newWidget.height = $(this).find("input.height").val();
          break;
        case "imgoutput":
          //console.log("add imgoutput");
          newWidget.title = $(this).find("input.title").val() || "NONE";
          newWidget.url = $(this).find("input.url").val();
          newWidget.updateTimeSek = parseInt($(this).find("input.updateTimeSek").val(), 10) || 599;
          break;
        default:
          // no more settings
          ;
      }

      newPage.widgets.push(newWidget);
    });

    newConfig.pages.push(newPage);
  });


  newConfig.alarmpage = false;
  //console.log(newConfig);
  //console.log(JSON.stringify(newConfig));
  localStorage.setItem('appConfig', JSON.stringify(newConfig));

  let qrCodeData = {
    url: newConfig.dataprovider.url,
    type: newConfig.dataprovider.type,
    // configStateId: newConfig.dataprovider.configStateId,
    fileName: newConfig.dataprovider.fileName,
  }
  let qrCodeDataString = JSON.stringify(qrCodeData);
  $("#qrcode-holder").html("");
  let qrCode = new QRCode(document.getElementById("qrcode-holder"), {
    width: 200,
    height: 200
  });
  qrCode.makeCode(qrCodeDataString);


  if (saveInFile) {
    // save in File (minukodu-config-FileName)
    if (socket) {
      console.log("save in File " + newConfig.dataprovider.fileName);
      //(filename, data, mode, callback)

      socket.emit("writeFile", null, filePath + "/" + newConfig.dataprovider.fileName, JSON.stringify(newConfig),
        function (error) {
          if (error) {
            console.log("Error saving Config in file: " + error);
            show_message("Error storing config in: " + newConfig.dataprovider.fileName, "danger");
          } else {
            console.log("Saving Config in file successfull");
            show_message("Stored config in: " + newConfig.dataprovider.fileName, "success");
            readConfigFiles(); // Update File dropdown
          }
        });
    } else {
      show_message("Error storing config: Please connect socket first", "danger");
    }
  }
  return newConfig;

}

function addPage(pageData = {}) {
  var uuid = pageData.UUID || UUID();
  var pageTitle = pageData.title || "PageName";
  var pageIsStartpage = pageData.startpage || false;

  var newPage = $(templates.page)
    .clone()
    .attr("id", uuid)
    .attr("data-id", uuid);
  $(newPage)
    .find("input.page-title")
    .attr("value", pageTitle);
  if (pageIsStartpage) {
    $(newPage)
      .find(".isstartpage")
      .attr("checked", "checked");
  }
  $(newPage)
    .find("input.page-title")
    .focus(function () {
      $(this).select();
    })
    .mouseup(function (e) {
      e.preventDefault();
    })
    .keyup(function () {
      $('a[href="#' + uuid + '"] p .page-title').text($(this).val());
      //console.log($(this).val());
    });

  $("#pages .tab-content").append(newPage);

  $(".btn-page-delete").click(function () {
    var uuid = $(this)
      .parent()
      .parent()
      .attr("id");
    $(".nav-link[href='#" + uuid + "'")
      .parent()
      .remove();
    $(this)
      .parent()
      .parent()
      .remove();
    $(".menu-link-page")
      .first()
      .click();
    renamePages();
  });

  // BUGGIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
  // $(".isstartpage").change(function() {
  //   $(".nav-startpage-icon").addClass("visibility-hidden");
  //   // console.log($(this).is(":checked"));
  //   if ($(this).is(":checked")) {
  //     // $(".isstartpage").removeAttr("checked");
  //     // $(this).attr("checked", "checked");

  //     uuid = $(this).closest(".page").attr("id");
  //     $(".nav-link[href='#" + uuid + "'")
  //     .find(".nav-startpage-icon")
  //     .removeClass("visibility-hidden");
  //   }
  // });
  // BUGGIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII

  // remove active class page-tab
  $(".page-nav-item.active").removeClass("active");
  // now add page-tab
  var newPageTab = $(templates.pageTab);
  //console.log(newPageTab);
  $(newPageTab)
    .attr("data-id", uuid)
    .find("a")
    .attr("href", "#" + uuid);
  //.addClass("active");
  $(newPageTab)
    .find("a")
    .click(function () {
      $(".page").hide();
      $("#" + uuid).show(100);
    });
  if (pageIsStartpage) {
    $(newPageTab)
      .find(".nav-startpage-icon")
      .removeClass("visibilty-hidden");
  }

  $(newPageTab)
    .find("p .page-title")
    .text(pageTitle);
  $(newPageTab).insertBefore("#pages-nav-item-end");
  $(".page").hide();
  $("#" + uuid).show(100);

  // prevent ENTER
  $("input").keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      return false;
    }
  });

  init_widget_dropdown(uuid);
  // init_sortable
  //init_sortable();

  renamePages();
  // return uuid
  return uuid;
}

function renamePages() {
  var pageNumber = 1;
  $("#pages .page").each(function () {
    var uuid = $(this).attr("id");
    var pageNumberText = "Page " + pageNumber;
    $(this)
      .find(".label-page-name")
      .text(pageNumberText);
    //console.log("Page "+ pageNumber);
    $('a[href="#' + uuid + '"] p .page-number').text(pageNumberText);
    pageNumber++;
  });
  var nbOfPages = $("#pages .label-page-name").length;

  if (nbOfPages < 2) {
    $(".btn-page-delete").hide();
  } else {
    $(".btn-page-delete").show();
  }
}

function init_widget_dropdown(pageUUID) {
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

  var widgetId = "wg-" + pageUUID;

  $(widgetDropdown)
    .attr("id", widgetId)
    .appendTo("#" + pageUUID + " .widget-dropdown-holder");

  for (var widget in templates.widgets) {
    //console.log(widget);
    $(widgetDropdownOption)
      .text(widget)
      .attr("data-widgetName", widget)
      .attr("data-pageUUID", pageUUID)
      .click(function () {
        addWidgetToPage(
          $(this).attr("data-widgetName"),
          $(this).attr("data-pageUUID")
        );
      })
      .appendTo("#" + widgetId + " .dropdown-menu");
  }
  $("#" + widgetId).dropdown();
}

function addWidgetToPage(widget, pageUUID) {
  // console.log(widget);
  //console.log(pageUUID);
  uuid = UUID();

  //console.log(templates.widgets[widget]);

  if (templates.widgets[widget]) {
    $(templates.widgets[widget])
      .attr("id", uuid)
      .attr("data-id", uuid)
      .insertBefore("#" + pageUUID + " .widget-holder-end");
  }
  $("#" + uuid + " .btn-widget-copy").click(function () {
    //console.log($(this));
    var thisWidget = $(this).closest(".widget").first();
    var uuid = UUID();
    var copiedWidget = thisWidget
      .clone(true)
      .attr("id", uuid)
      .attr("data-id", uuid);
    // console.log(thisWidget);
    // console.log(copiedWidget);  
    thisWidget.after(copiedWidget);
  });
  $("#" + uuid + " .btn-widget-remove").click(function () {
    $(this).closest(".widget").remove();
  });
  $("#" + uuid + " .btn-widget-collapse").click(function () {
    console.log("collapse");
    $(this).closest(".widget").find(".card-body").toggle(200);
  });

  $("#" + uuid + ".widget .widget-title-form input").focus(function () {
    $(this).select();
  });

  $("#" + uuid + ".widget .widget-title-form input").keyup(function () {
    //console.log("title input keyup");
    $(this)
      .closest(".card")
      .find(".card-header .settings-title")
      .text($(this).val());
  });
  $("#" + uuid + ".widget input.url").keyup(function () {
    //console.log("title input keyup");
    $(this)
      .closest(".card")
      .find(".card-header .settings-url")
      .text($(this).val());
  });
  // make sortable
  init_sortable();
  // return uuid
  return uuid;
}

// function init_editable() {
//   //turn to inline mode
//   $.fn.editable.defaults.mode = "inline";
//   $(document).ready(function() {
//     $(".editable").editable();
//     //$('.page h4').editable();
//     //$('h6').editable();
//   });
// }

function init_sortable() {
  var widgetHolders = document.getElementsByClassName("widget-holder");

  [].forEach.call(widgetHolders, function (elem) {
    new Sortable(elem, {
      group: {
        name: "shared"
      },
      animation: 150,
      handle: ".handle",
      onSort: function (/**Event*/ evt) {
        // console.log("onSort");
        // console.log(evt);
        //renamePages();
      }
    });
  });
}
function init_download() {
  $("#btn-dl-config").click(function () {
    console.log("Handler for download config called.");

    generateConfig();

    var appConfig = localStorage.getItem("appConfig", "no config found");

    appConfig = templates.configJSprePend + "\n" + appConfig;
    appConfig = appConfig + "\n" + templates.configJSpostPend;

    var uuid = UUID();
    var element = $("<a></a>");

    element.attr("id", uuid);
    element.attr("href", "data:text/plain;charset=utf-8," + appConfig);
    element.attr("download", "config.js");

    element.hide();

    $("body").prepend(element);
    //$("#" + uuid).css("height","100px").css("display","block");
    console.log(element);
    $("#" + uuid)
      .get(0)
      .click();
    $("#" + uuid).remove();
  });
}

function connect_socket() {
  //console.log("Socket init");

  $(".form-connection .input-group-text")
    .removeClass("alert-danger")
    .removeClass("alert-sucess")
    .addClass("alert-info");

  $("#btn-read-variables").attr("disabled", "disabled");
  $("#btn-read-configfiles").attr("disabled", "disabled");

  var socketUrl = $("#data-url-port").val();

  console.log(socketUrl);

  //var socket   = io.connect('https://iobroker.pro', {path: "/socket.io"});
  // var socket = io.connect("http://nucci:9090", { path: "/socket.io" });

  socket = io.connect(socketUrl, { path: "/socket.io" });

  variables = JSON.parse(localStorage.getItem("variables") || null);

  var states = variables;

  init_statesTypeahead();

  //socket.emit('name', 'myButlerBuilder.0');

  socket.on("connect", function () {
    console.log("Connect ok");
    $("#btn-read-variables").removeAttr("disabled");
    $("#btn-read-configfiles").removeAttr("disabled");
    $(".form-connection .input-group-text")
      .removeClass("alert-info")
      .addClass("alert-success");
    show_message("sucessfully connected", "success");
    readVariables();
    readConfigFiles()
  });
  socket.on("connect_error", function () {
    console.log("Connection failed");
    $(".form-connection .input-group-text")
      .removeClass("alert-info")
      .addClass("alert-danger");
    show_message("error when connecting", "danger");
    socket.disconnect();
  });
  socket.on("reconnect_failed", function () {
    console.log("Reconnection failed");
    $(".form-connection .input-group-text")
      .removeClass("alert-info")
      .addClass("alert-danger");
    show_message("error when connecting", "danger");
    socket.disconnect();
  });

  $("#btn-read-variables").click(function (event) {

    readVariables();

  });

  $("#btn-read-configfiles").click(function (event) {

    readConfigFiles();

  });


  function readVariables() {
    console.log("read variables");

    $("#btn-read-variables .btn-label i").attr(
      "class",
      "fas fa-spinner fa-spin"
    );
    $("#btn-read-variables").attr("disabled", "disabled");

    //console.log(socket);
    //console.log(socket.connected);
    localStorage.setItem("variables", "");

    socket.emit("getStates", function (err, _states) {
      console.log("Received " + Object.keys(_states).length + " states.");
      //console.log(_states);
      variables = Object.keys(_states);
      localStorage.removeItem("variables");
      localStorage.setItem("variables", JSON.stringify(variables));
      variables = JSON.parse(localStorage.getItem("variables"));
      console.log("Stored " + variables.length + " states.");
      //console.log(variables);

      init_statesTypeahead();

      //socket.emit("delObject","myAlarme.VisuMeldungen.Alarme.neuAlalrm");

      show_message("Stored " + variables.length + " states.", "success");

      $("#btn-read-variables").removeAttr("disabled");
      $("#btn-read-variables .btn-label i").attr("class", "fas fa-list");
    });
  };

};

function readConfigFiles() {

  $("#btn-read-configfiles .btn-label i").attr(
    "class",
    "fas fa-spinner fa-spin"
  );
  $("#btn-read-configfiles").attr("disabled", "disabled");

  socket.emit("readDir", null, "/" + filePath + "/", function (err, list) {

    console.log(err);
    console.log(list);
    $("#filelist li").remove();
    let fileCount = 0;
    for (let file of list) {
      fileCount++;
      if (fileCount === list.length && $("#select-configfile").val().length < 1) { $("#select-configfile").val(removeFileExtension(file.file)) }
      if (file.isDir === false && file.file.substring(file.file.length - 5, file.file.length) === ".json") {
        $("#filelist").prepend('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" onclick="selectFileFromList(this)">' + removeFileExtension(file.file) + '</a></li>');
      }
    }

    show_message("Found " + list.length + " config-files.", "success");



    $("#btn-read-configfiles").removeAttr("disabled");
    $("#btn-read-configfiles .btn-label i").attr("class", "fas fa-list");

  })

};

function selectFileFromList(elem) {
  //console.log(elem);
  $("#select-configfile").val(elem.text);
  readConfigFromFile(elem.text + ".json");
}

function readConfigFromFile(fileName) {
  if (socket) {
    socket.emit("readFile", null, filePath + "/" + fileName, function (error, fileData, mimeType) {
      console.log(mimeType);
      //console.log(fileData);
      console.log(error);
      localStorage.setItem('appConfig', fileData);
      generatePages();
    });
  } else {
    show_message("Error loading config: Please connect socket first", "danger");
  }
};

function deleteConfigFile(fileName) {
  if (socket) {
    socket.emit("unlink", null, filePath + "/" + fileName, function (error) {
      console.log(error);
      show_message("file deleted: " + fileName, "success");
    });
  } else {
    show_message("Error delete file: Please connect socket first", "danger");
  }
};



function init_statesTypeahead() {
  $(".states-select .typeahead").typeahead('destroy');
  $(".states-select .typeahead").typeahead(
    {
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: "states",
      source: substringMatcher(variables),
      limit: 5000
    }
  );
}

var substringMatcher = function (strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, "i");

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function (i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

function show_message(message = "message", color = "danger") {
  $("#message-holder")
    .prepend('<div class="message alert" role="alert"></div>')
    .find(".alert")
    .first()
    .text(message)
    .addClass("bg-" + color);
}

function init_modal() {
  $("#selectModal").on("show.bs.modal", function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var modalClass = button.data("select"); // Extract info from data-* attributes
    $(this)
      .removeClass("iconSelect stateSelect iconFaSelect")
      .addClass(modalClass);
    //$(this).data("widget", button.closest('.widget').data('id'));
    $(this).attr("data-widget", button.closest(".widget").attr("id"));
    $(this).attr("data-class", modalClass);

    $(this)
      .find("div.hide-at-start")
      .hide();

    //console.log(modalClass);

    if (modalClass.indexOf("tate") > 0) {
      // do we have states ???
      var nbVariables = 0;
      if (variables) {
        nbVariables = variables.length;
      }
      var infoBgClass = "bg-success pt-1 pb-1 pl-1";
      var infoText = nbVariables + " states to select"
      if (nbVariables < 1) {
        infoBgClass = "bg-danger pt-1 pb-1 pl-1";
        infoText = "Please connect and read states first !"
      }
      $("#modal-states-info-text")
        .removeClass()
        .addClass(infoBgClass)
        .text(infoText);

      $(this)
        .find("div.states-select")
        .show();
    }
    if (modalClass.indexOf("iconFa") > 0) {
      $(this)
        .find("div.fa-icon-select")
        .show();
    }
    if (modalClass.indexOf("conSe") > 0) {
      $(this)
        .find("div.icon-select")
        .show();
    }
    //$('#mfd-iconselect-dropdown.dropdown').dropdown("hide");
  });

  $("#selectModal .btn-ok").click(function () {
    $("#selectModal").modal("hide");
  });

  $("#selectModal").on("hide.bs.modal", function () {
    submit_modal();
  });
  // init icon dropdown
  $('.icon-select select').text("");
  $('.icon-select').load('dist/js/iconselect.html', function () {
    $('#mfd-iconselect-dropdown.dropdown').dropdown();
    init_iconselect_dropdown();
  });

}

function init_iconselect_dropdown() {

  $('#mfd-iconselect-dropdown .dropdown-menu button').click(function (event) {
    event.preventDefault();
    console.log($(this).data("iconvalue"));
    $('#mfd-iconselect-dropdown .icon-holder i')
      .removeClass()
      .addClass("mfd-icon " + $(this).data("iconvalue"))
      .attr("data-iconvalue", $(this).data("iconvalue"));
    console.log($('#mfd-iconselect-dropdown .icon-holder i'));
    //$('#mfd-iconselect-dropdown.dropdown').dropdown("hide");
    $("#selectModal").modal('hide');
  });
}

function submit_modal() {
  var widgetId = $("#selectModal").attr("data-widget");
  var modalClass = $("#selectModal").attr("data-class");
  console.log(modalClass);
  var value = "";
  if (modalClass.indexOf("tate") > 0) {
    // submit state
    value = $("#selectModal .tt-input")
      .not(".tt-hint")
      .val();
  } else if (modalClass.indexOf("aIconSel") > 0) {
    // submit fa-icon
    // value = $("#selectModal button .icon-name").text();
    // console.log(value);
    // $("#" + widgetId + " ." + modalClass)
    //   .parent()
    //   .find("i")
    //   .removeClass()
    //   .addClass("mfd-icon " + value);
  } else if (modalClass.indexOf("conSelect") > 0) {
    // submit mfd-icon
    value = $("#mfd-iconselect-dropdown .icon-holder i").attr("data-iconvalue");
    console.log("from modal:");
    console.log(value);
    $("#" + widgetId + " ." + modalClass)
      .attr("data-icon", value);
    $("#" + widgetId + " ." + modalClass)
      .find("i")
      .removeClass()
      .addClass("mfd-icon " + value);
  }

  $("#" + widgetId + " ." + modalClass).attr("value", value);
  $("#" + widgetId + " ." + modalClass).val(value);
  console.log(value);
  if (modalClass === "iconSelect") {
    $("#" + widgetId + " .card-header .settings-icon").text(value);
  }
  if (modalClass === "stateSelect") {
    $("#" + widgetId + " .card-header .settings-state").text(value);
  }
}

function removeFileExtension(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}

function init() {
  console.log("App init");

  $(".nav-item a.menu-link-page").on("click", function (e) {
    e.preventDefault();
    $(".page").hide();
    $($(this).attr("href")).show();
    //console.log($(this).attr("href"));
  });

  $(document).ready(function () {
    // init buttons
    $("#btn-ul-config").click(function () {
      $("#upload-config-file").click();
    });
    $("#btn-add-page").click(function () {
      //console.log("Handler for add Page called.");
      addPage();
    });
    $("#btn-connect").click(function (event) {
      connect_socket();
    });
    $("#btn-read-variables").attr("disabled", "disabled");
    $("#btn-read-configfiles").attr("disabled", "disabled");

    $("#select-configfile").on("keyup", function () {
      //console.log(this.value);
      $("#select-configfile").val(sanitize(this.value));

    });

    $("#btn-save-file").on("click", function () {
      console.log("Save config in file");
      generateConfig();
    });

    $("#btn-load-file").on("click", function () {
      console.log("load config from file");
      readConfigFromFile($("#select-configfile").val() + ".json");
    });

    $("#btn-delete-file").on("click", function () {
      console.log("delete config-file");
      deleteConfigFile($("#select-configfile").val() + ".json");
    });

    init_download();

    // try to read variables
    variables = JSON.parse(localStorage.getItem("variables") || null);
    init_statesTypeahead();
    // init-iconpicker
    $(".icp").iconpicker();
    // init modal
    init_modal();

    $("#preview-nav-item").click(function (event) {
      event.preventDefault();
      appConfig = generateConfig();
      const url = encodeURIComponent(appConfig.dataprovider.url);
      const file = encodeURIComponent(appConfig.dataprovider.fileName);
      const preViewURL = "/minukodu?url=" + url + "&file=" + file + "&forceUpdate";

      window.open(preViewURL, '_blank');
    });

    $("#show-config-nav-item").click(function (event) {
      event.preventDefault();
      generateConfig();
      var outConfig = localStorage.getItem("appConfig");
      $("#show-config-holder pre").html();
      $("#show-config-holder pre").html(JSON.stringify(JSON.parse(outConfig), null, 2));
      $("#configShowModal").modal("show");
    });

    $("#only-show-config-nav-item").click(function (event) {
      event.preventDefault();
      generateConfig(false);
      var outConfig = localStorage.getItem("appConfig");
      $("#show-config-holder pre").html();
      $("#show-config-holder pre").html(JSON.stringify(JSON.parse(outConfig), null, 2));
      $("#configShowModal").modal("show");
    });

    // $("#btn-widgets-show-all").click(function (event) {
    //   event.preventDefault();
    //   $(".btn-widget-collapse").closest(".widget").find(".card-body").show();
    // });


    // $("#btn-widgets-collapse-all").click(function (event) {
    //   event.preventDefault();
    //   $(".btn-widget-collapse").closest(".widget").find(".card-body").hide();
    // });

    addPage();
    // if config then generate Pages
    generatePages();

  });
}

init();

//////////////// helper functions

function sanitize(input) {

  var replacement = "_";

  var illegalRe = /[\/\?<>\\:\*\|"]/g;
  var controlRe = /[\x00-\x1f\x80-\x9f]/g;
  var reservedRe = /^\.+$/;
  var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  var windowsTrailingRe = /[\. ]+$/;

  if (typeof input !== 'string') {
    throw new Error('Input must be string');
  }
  var sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return sanitized;
}
