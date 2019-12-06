const appConfig =
// Start Settings to edit in JSON Editor
// https://chrome.google.com/webstore/detail/json-editor/lhkmoheomjbkfloacpgllgjcamhihfaj
{
  "settings": {
    "LayoutDunkel": true,
    "SplitterOpen": true
  },
  "dataprovider": {
    "type": "ioboker",
    "url": "ws://192.168.178.42:9090"
  },
  "pages": [
    {
      "title": "Küche & Bad",
      "startpage": true,
      "widgets": [
        {
          "type": "slider",
          "title": "Rolladen AZ",
          "stateId": "hm-rpc.0.001118A99507AB.4.LEVEL",
          "min": 0,
          "max": 100,
          "step": 5,
          "iconLow": "md-brightness-low",
          "iconHigh": "md-brightness-high",
          "unit": "%"
        },
        {
          "type": "iframe",
          "title": "NONE",
          "url": "http://nucci:8082/vis/kalender/mycalendar.html?instance=0",
          "updateTimeSek": 900,
          "width": "100%",
          "height": "300px"
        },
        {
          "type": "filler"
        },
        {
          "type": "switch",
          "title": "Testschalter",
          "stateId": "myAlarme.VisuMeldungen.Alarme.Testgestoert"
        },
        {
          "type": "output",
          "title": "Gefrierschrank Leistung",
          "stateId": "hm-rpc.1.NEQ0707208.2.POWER",
          "unit": "W"
        },
        {
          "type": "indicator",
          "title": "Gefrierschrank WLAN",
          "stateId": "hm-rpc.1.NEQ0707208.0.UNREACH",
          "icon": 'it_wifi',
          "negate": false,
          "additionalClass": 'alarm'
        }
      ]
    },
    {
      "title": "Schlafzimmer",
      "startpage": false,
      "widgets": [
        {
          "type": "iframe",
          "title": "ORF News",
          "url": "https://www.orf.at",
          "updateTimeSek": 900,
          "width": "500px",
          "height": "500px"
        },
        {
          "type": "switch",
          "title": "Test Bticino",
          "stateId": "myAlarme.VisuMeldungen.Alarme.Kommunikation_bticino_gestoert"
        },
        {
          "type": "html",
          "title": "Ical Kalender",
          "stateId": "ical.0.data.wochenplan"
        },
        {
          "type": "imgoutput",
          "title": "Verkehr Bremen",
          "url": 'http://nucci:8082/state/phantomjs.0.pictures.verkehr_png',
          "updateTimeSek": 60
        }
      ]
    }
  ],
  "alarmpage": true
}
  // End Settings to edit in JSON Editor
  ;
console.dir(appConfig);
//#####################################################################
// in LocalStorage ablegen
localStorage.setItem('appConfig', JSON.stringify(appConfig));
//#####################################################################
