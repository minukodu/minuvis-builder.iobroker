var widgetJSON = {
  switch: {
    type: "switch",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
  },
  indicator: {
    type: "indicator",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    icon: {
      type: "icon",
      default: "audio_play",
      tooltip: "icon of indicator"
    },
    iconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    colorWhenTrue: {
      type: "color",
      default: "#00FF00",
      tooltip: "color when state is true"
    },
    colorWhenFalse: {
      type: "color",
      default: "#FF0000",
      tooltip: "color when state is false"
    },
  },
  range: {
    type: "range",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    updateOnComplete: {
      type: "boolean",
      default: "true",
      tooltip: "update state at completion instead on every change"
    },
    minIcon: {
      type: "icon",
      default: "text_min",
      tooltip: "icon in minimal position"
    },
    minIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of min-icon"
    },
    min: {
      type: "number",
      default: "10",
      tooltip: "minimal value of range"
    },
    maxIcon: {
      type: "icon",
      default: "text_max",
      tooltip: "icon in maximal position"
    },
    maxIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of max-icon"
    },
    max: {
      type: "number",
      default: "90",
      tooltip: "maximal value of range"
    },
    step: {
      type: "number",
      default: "5",
      tooltip: "step value of range"
    },
    unit: {
      type: "string",
      default: "%",
      tooltip: "unit of the value"
    },
  },
  slider: {
    type: "slider",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    minIcon: {
      type: "icon",
      default: "text_min",
      tooltip: "icon in minimal position"
    },
    minIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of min-icon"
    },
    min: {
      type: "number",
      default: "10",
      tooltip: "minimal value of slider"
    },
    maxIcon: {
      type: "icon",
      default: "text_max",
      tooltip: "icon in maximal position"
    },
    maxIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of max-icon"
    },
    max: {
      type: "number",
      default: "90",
      tooltip: "maximal value of slider"
    },
    step: {
      type: "number",
      default: "5",
      tooltip: "step value of slider"
    },
    unit: {
      type: "string",
      default: "%",
      tooltip: "unit of the value"
    },
  },
  output: {
    type: "output",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    color: {
      type: "color",
      default: "#FFFFFF",
      tooltip: "color when value is between min and max"
    },
    minColor: {
      type: "color",
      default: "#0000FF",
      tooltip: "color when value < min"
    },
    minValue: {
      type: "number",
      default: "10",
      tooltip: "minimal value"
    },
    maxColor: {
      type: "color",
      default: "#FF0000",
      tooltip: "color when value > max"
    },
    maxValue: {
      type: "number",
      default: "90",
      tooltip: "maximal value"
    },
    unit: {
      type: "string",
      default: "%",
      tooltip: "unit of the value"
    },
    format: {
      type: "numeraljs",
      default: "0.00",
      tooltip: "click mouse and see at <a href='http://numeraljs.com/#format' target='_blank'>http://numeraljs.com/#format</a>"
    },
  },
  valueswitcher: {
    type: "valueswitcher",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title :: NONE=no title, ICONONLY=show icon without text"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    hideValue: {
      type: "boolean",
      default: "false",
      tooltip: "do not display value"
    },
    hideText: {
      type: "boolean",
      default: "false",
      tooltip: "do not display text"
    },
    readOnly: {
      type: "boolean",
      default: "false",
      tooltip: "no reaction on pressed button "
    },
    hightlightExactValueOnly: {
      type: "boolean",
      default: "false",
      tooltip: "only for state-type: 'number'<br/>fill button if value matches exactly"
    },
    nbOfButtons: {
      type: "number",
      default: "4",
      min: "1",
      max: "4",
      tooltip: "maximal value"
    },
    icon1: {
      type: "icon",
      default: "edit_numeric_1",
      tooltip: "icon for button 1"
    },
    iconFamily1: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon1"
    },
    value1: {
      type: "string",
      default: "100",
      tooltip: "value of button 1"
    },
    icon2: {
      type: "icon",
      default: "edit_numeric_2",
      tooltip: "icon for button 2"
    },
    iconFamily2: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon2"
    },
    value2: {
      type: "string",
      default: "200",
      tooltip: "value of button 2"
    },
    icon3: {
      type: "icon",
      default: "edit_numeric_3",
      tooltip: "icon for button 3"
    },
    iconFamily3: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon3"
    },
    value3: {
      type: "string",
      default: "300",
      tooltip: "value of button 3"
    },
    icon4: {
      type: "icon",
      default: "edit_numeric_4",
      tooltip: "icon for button 4"
    },
    iconFamily4: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon4"
    },
    value4: {
      type: "string",
      default: "400",
      tooltip: "value of button 4"
    },
    unit: {
      type: "string",
      default: "%",
      tooltip: "unit of the value"
    },
    showAsIndicator: {
      type: "boolean",
      default: "false",
      tooltip: "show like an indicator"
    },
    indicatorColor1: {
      type: "color",
      default: "#FFFFFF",
      tooltip: "color for value 1"
    },
    indicatorColor2: {
      type: "color",
      default: "#FFFFFF",
      tooltip: "color for value 2"
    },
    indicatorColor3: {
      type: "color",
      default: "#FFFFFF",
      tooltip: "color for value 3"
    },
    indicatorColor4: {
      type: "color",
      default: "#FFFFFF",
      tooltip: "color for value 4"
    },
  },
    datepicker: {
    type: "datepicker",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    format: {
      type: "momentjs",
      default: "DD.MM.YYYY",
      tooltip: "click mouse and see at <a href='https://momentjs.com/'  target='_blank'>https://momentjs.com/</a>"
    },
  },
  timepicker: {
    type: "timepicker",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
  },
  colorpicker: {
    type: "colorpicker",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
  },
  huecolorpicker: {
    type: "huecolorpicker",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    formatWithWhite: {
      type: "boolean",
      default: "false",
      tooltip: "returns #RRGGBBWW instead of #RRGGBB"
    },
  },
  iframe: {
    type: "iframe",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    url: {
      type: "string",
      default: "https://minukodu.de",
      tooltip: "url of the flot-diagram"
    },
    updateTimeSek: {
      type: "number",
      default: "600",
      tooltip: "update-time: reloads widget after xxx seconds"
    },
    height: {
      type: "string",
      default: "600px",
      tooltip: "height of the widget"
    },
  },
  flot: {
    type: "flot",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    url: {
      type: "string",
      default: "http://94.130.57.38:8082/flot/index.html?l%5B0%5D%5Bid%5D=yr.0.forecast.day0.temperatureActual&l%5B0%5D%5Boffset%5D=0&l%5B0%5D%5Baggregate%5D=minmax&l%5B0%5D%5Bcolor%5D=%23FF0000&l%5B0%5D%5Bthickness%5D=3&l%5B0%5D%5Bshadowsize%5D=1&l%5B0%5D%5Bname%5D=Temperatur&l%5B0%5D%5Byaxe%5D=rightColor&l%5B0%5D%5Bxaxe%5D=bottom&l%5B0%5D%5BignoreNull%5D=&l%5B0%5D%5BafterComma%5D=1&l%5B0%5D%5Bdashes%5D=false&l%5B0%5D%5BdashLength%5D=10&l%5B0%5D%5BspaceLength%5D=10&l%5B0%5D%5Bmin%5D=-10&l%5B0%5D%5Bmax%5D=40&l%5B0%5D%5Bunit%5D=%C2%B0C&l%5B0%5D%5Bfill%5D=0&l%5B1%5D%5Bid%5D=yr.0.forecast.day0.windSpeed&l%5B1%5D%5Boffset%5D=0&l%5B1%5D%5Baggregate%5D=minmax&l%5B1%5D%5Bcolor%5D=%2300FF00&l%5B1%5D%5Bthickness%5D=1&l%5B1%5D%5Bshadowsize%5D=1&l%5B1%5D%5Bname%5D=WindSpeed&l%5B1%5D%5Byaxe%5D=rightColor&l%5B1%5D%5Bxaxe%5D=off&l%5B1%5D%5BignoreNull%5D=&l%5B1%5D%5BafterComma%5D=0&l%5B1%5D%5Bdashes%5D=false&l%5B1%5D%5BdashLength%5D=10&l%5B1%5D%5BspaceLength%5D=10&l%5B1%5D%5Bmin%5D=0&l%5B1%5D%5Bmax%5D=100&l%5B1%5D%5Bunit%5D=km%2Fh&l%5B1%5D%5Bfill%5D=0.2&l%5B2%5D%5Bid%5D=yr.0.forecast.day0.pressure&l%5B2%5D%5Boffset%5D=0&l%5B2%5D%5Baggregate%5D=minmax&l%5B2%5D%5Bcolor%5D=%2300ffff&l%5B2%5D%5Bmin%5D=900&l%5B2%5D%5Bmax%5D=1100&l%5B2%5D%5Bthickness%5D=3&l%5B2%5D%5Bshadowsize%5D=3&l%5B2%5D%5Bunit%5D=mBar&l%5B2%5D%5Bname%5D=Pressure&l%5B2%5D%5Byaxe%5D=leftColor&l%5B2%5D%5Bxaxe%5D=off&l%5B2%5D%5BignoreNull%5D=&l%5B2%5D%5BafterComma%5D=0&l%5B2%5D%5Bdashes%5D=false&l%5B2%5D%5BdashLength%5D=10&l%5B2%5D%5BspaceLength%5D=10&l%5B2%5D%5Bfill%5D=0&timeType=relative&relativeEnd=now&range=4320&aggregateType=count&aggregateSpan=300&noBorder=noborder&window_bg=%23363636&bg=%23363636&legend=nw&hoverDetail=false&useComma=false&zoom=false&noedit=false&animation=0&x_labels_color=%23ffffff&y_labels_color=%23ffffff",
      tooltip: "url of the flot-diagram"
    },
    updateTimeSek: {
      type: "number",
      default: "600",
      tooltip: "update-time: reloads widget after xxx seconds"
    },
    height: {
      type: "string",
      default: "600px",
      tooltip: "height of the widget"
    },
    area1Name: {
      type: "string",
      default: "12 hours",
      tooltip: "name of area 1"
    },
    area1Time: {
      type: "number",
      default: "720",
      tooltip: "time in minutes of area 1"
    },
    area2Name: {
      type: "string",
      default: "day",
      tooltip: "name of area 2"
    },
    area2Time: {
      type: "number",
      default: "1440",
      tooltip: "time in minutes of area 2"
    },
    area3Name: {
      type: "string",
      default: "week",
      tooltip: "name of area 3"
    },
    area3Time: {
      type: "number",
      default: "10080",
      tooltip: "time in minutes of area 3"
    },
    area4Name: {
      type: "string",
      default: "month",
      tooltip: "name of area 4"
    },
    area4Time: {
      type: "number",
      default: "302400",
      tooltip: "time in minutes of area 4"
    },
  },
  jsontable: {
    type: "jsontable",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    colheader: {
      type: "string",
      default: "header1,header2,header3",
      tooltip: "Text of Tableheaders, comma-separated"
    },
    colsize: {
      type: "string",
      default: "100,100,100",
      tooltip: "size of tablecolumns, comma-separated, 0 for hide column"
    },
  },
  html: {
    type: "html",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    stateId: {
      type: "stateId",
      default: "no state selected",
      tooltip: "id of state"
    },
    stateIdType: {
      type: "stateIdType",
      default: "none",
      tooltip: "type of state"
    },
    height: {
      type: "string",
      default: "500px",
      tooltip: "height of the widget"
    },
  },
  imgoutput: {
    type: "imgoutput",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    url: {
      type: "string",
      default: "https://minukodu.de/sites/default/files/styles/artikelslideshowfull/public/2020-04/github_webapp_0.jpg",
      tooltip: "url of the image"
    },
    height: {
      type: "string",
      default: "300px",
      tooltip: "height of the widget"
    },
  },
  filler: {
    type: "filler",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    showAsHeader: {
      type: "boolean",
      default: "false",
      tooltip: "show like a small header"
    },
  },
  linkbutton: {
    type: "linkbutton",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
    targetpage: {
      type: "pageList",
      default: "startpage",
      tooltip: "name of the page to link"
    },
  },
  compactModeStart: {
    type: "compactModeStart",
    titleIcon: {
      type: "icon",
      default: "audio_play",
      tooltip: "title-icon"
    },
    titleIconFamily: {
      type: "iconFamily",
      default: "mfd-icon",
      tooltip: "family of icon"
    },
    title: {
      type: "string",
      default: "NONE",
      tooltip: "title <br/>NONE=no title <br/>ICONONLY=show icon without text<br/>NOICON_+text =show title without icon"
    },
  },
  compactModeEnd: {
    type: "compactModeEnd",
  },
};
