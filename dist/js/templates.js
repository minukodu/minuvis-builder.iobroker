function getTemplates () {

    var templates = {};

    templates.widgets = [];

    templates.configJSprePend = "const appConfig =";
    templates.configJSpostPend =
      ";localStorage.setItem('appConfig', JSON.stringify(appConfig));";
    
    templates.page = `
    <div class="tab-pane page tinted nested-sortable" data-id="page1">
        <h4 data-toggle="tooltip" data-placement="top" title="page with pagename and selection if used as startpage">Page 1
        </h4>
        <form class="form-inline">
            <label class="sr-only">Name</label>
            <input type="text" class="form-control mb-2 mr-sm-2 pagetitle" placeholder="Title of Page"></input>
            <div class="form-check mb-2 mr-sm-2">
                <input class="form-check-input isstartpage" type="checkbox">
                <label class="form-check-label" for="inlineFormCheck">
                    is Startpage
                </label>
            </div>
            <button type="button" class="btn btn-sm btn-labeled btn-outline-secondary btn-page-delete">
                <span class="btn-label"><i class="far fa-trash-alt"></i></span>
                delete Page
            </button>
        </form>
        <div class="widget-holder"></div>
    </div>
    `;
    
    templates.widgets["indicator"] = `
    <div class="list-group-item widget indicator widget-with-form">
        <h6>Indicator</h6>
        <i class="fas fa-arrows-alt handle"></i>
        <button type="button" class="btn btn-secondary btn-sm btn-widget-open-close">open/close</button>
        <div class="widget-title-form form">
            <div class="form-group">
                <input type="text" class="form-control title" value="NONE">
                <small class="form-text text-muted hidden">NONE to hide title</small>
            </div>
        </div>
        <div class="clear-both"></div>
        <form class="form form-inline">
            <div class="form-group">
                <div class="input-group mb-3">
                    <input type="text" class="form-control iconSelect" placeholder="icon" aria-label="Select Icon">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" data-toggle="modal"
                            data-target="#selectModal" data-select="iconSelect">
                            <span class="btn-label">
                                <i class="mfd-icon audio_audio"></i>
                            </span>
                            select Icon
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input showasalarm">
                <label class="form-check-label" for="exampleCheck1">Show as Alarm</label>
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input negate">
                <label class="form-check-label" for="exampleCheck1">negate signal</label>
            </div>
        </form>
        <div class="form">
            <div class="input-group mb-3">
                <input type="text" class="form-control stateSelect" placeholder="state" aria-label="Select Icon">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" data-toggle="modal" data-target="#selectModal"
                        data-select="stateSelect">select State</button>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-labeled btn-outline-secondary btn-widget-copy">
                <span class="btn-label"><i class="far fa-copy"></i></span>
                copy
            </button>
            <button type="button" class="btn btn-sm btn-labeled btn-outline-secondary btn-widget-delete">
                <span class="btn-label"><i class="far fa-trash-alt"></i></span>
                delete
            </button>
        </div>
    </div>
    `;
    templates.widgets["filler"] = `
    <div class="list-group-item widget indicator">
        <h6>Filler</h6>
        <i class="fas fa-arrows-alt handle"></i>
        <button type="button" class="btn btn-sm btn-labeled btn-outline-secondary btn-widget-delete">
            <span class="btn-label"><i class="far fa-trash-alt"></i></span>
            delete
        </button>
    </div>
    `;
    
    templates.pageTab = `
              <li class="nav-item page-nav-item">
                  <a class="nav-link page-tab"  data-toggle="tab" href="#home" role="tab" >Page 1</a>
              </li>`;
    


    return templates;
}