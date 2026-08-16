/**
 * Factory for the handful of HTML template-literal strings the app clones
 * via jQuery (`$(templates.page).clone()` etc.): one page skeleton, one
 * page-tab skeleton, one dev-mode banner. `templates.widgets` used to hold
 * ~14 more per-widget-type template strings (2026-08 migration: found to be
 * 100% dead - written but never read anywhere - and removed, along with the
 * now-orphaned template_Timeswitch.js which populated a 15th, also-dead
 * entry). Left as an empty array here only because nothing currently reads
 * or writes it; safe to delete outright if that stays true.
 */
export function getTemplates () {

    var templates = {};

    templates.widgets = [];

	// only for download button
	// not available at the moment
	//
    // templates.configJSprePend = "const appConfig =";
    // templates.configJSpostPend = ";localStorage.setItem('appConfig', JSON.stringify(appConfig));";
    
    templates.devNote = "<div id='dev-note'>Attention ! This is a development-site for <i>Version 2</i> ! For production goto <a href='http://builder.minukodu.de'>http://builder.minukodu.de</a> or <a href='http://v2.builder.minukodu.de'>http://v2.builder.minukodu.de</a></div>";
    
    templates.pageTab = `
    <li class="nav-item page-nav-item">
        <div class="container">
            <div class="row">
                <div class="col-sm-2">
                    <span class="badge badge-secondary page-order">99</span>
                </div>
                <div class="col-sm-10">
                    <a href="#pageHome" class="nav-link menu-link-page">
                        <i class="mfd-icon nav-icon audio_play"></i>
						<!--
                        <i class="fas fa-rocket nav-startpage-icon visibility-hidden"></i>
						-->
                        <span class="page-title">PageName</span>
                    </a>
                </div>
            </div>
        </div>
    </li>
    `;
    
    templates.page = `
    <!-- page -->
    <div class="tab-pane page tinted nested-sortable" data-id="60248645-ca99-4c2c-8d14-b614665439ae"
         id="60248645-ca99-4c2c-8d14-b614665439ae">
		 
        <!-- icon, title and startpage -->
        <form class="form-inline mb-3">
            <div class="input-group input-group-sm">

                <div class="input-group-prepend">
                    <span class="input-group-text alert-info label-page-name">Page</span>
                </div>
                <input type="number" class="form-control  form-control-sm page-order" value=99 min=1 max=99>
                <div class="input-group-prepend">
                    <button class="btn btn-primary hidden btn-apply-page-order" type="button">
                        <span class="btn-label"><i class="fas fa-sort"></i></span>
                        Apply page order
                    </button>
                </div>
                <input type="text" class="form-control  form-control-sm page-title" placeholder="Name of page"
                       value="Page 1">
            </div>
			<div class="form-group ml-1 mr-1">
				<div class="input-group iconselectfromcontrol icon-select iconSelectPage" data-icon="audio_play">
					<div class="input-group-prepend">
						<span class="input-group-text"><i class="mfd-icon audio_play"></i></span>
					</div>
					<div class="input-group-append">
						<button class="btn btn-primary btn-sm" type="button" data-toggle="modal"
								data-target="#selectModal" data-select="iconSelectPage">
							page-icon
						</button>
					</div>
				</div>
            </div>
            <div class="form-check ml-2">
                <input class="form-check-input isstartpage" type="checkbox">
                <label class="form-check-label">
                    is Startpage
                </label>
            </div>

            <!-- copy button -->
            <button type="button" class="btn btn-sm btn-labeled btn-primary btn-page-copy ml-2">
                <span class="btn-label"><i class="far fa-copy"></i></span>
                copy Page
            </button>
            <!-- delete button -->
            <button type="button" class="btn btn-sm btn-labeled btn-outline-danger btn-page-delete mt-1">
                <span class="btn-label"><i class="far fa-trash-alt"></i></span>
                delete Page
            </button>
        </form>
    
        <!-- widgets -->
        <div class="widget-holder">
        
            <div class="grid-holder"></div>
            <div class="widget-holder-end" class="hidden"></div>
            <div class="form addWidgetToPageHolder widget-dropdown-holder">
            </div>
        </div>
    </div>
    <!-- /page -->
    `;
    
    return templates;
}