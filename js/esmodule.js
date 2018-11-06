class Esglobe {
    constructor () {
        this.formBuilder = new FormBuilder();
        this.initHandlebars();
    }

    initHandlebars() {
        if (typeof Handlebars !== 'undefined') {
            Handlebars.registerHelper('ifeq', function (a, b, options) {
                if (a === b) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            });

            const partialTemplates = {};

            $.when(
                $.get('/esglobe/js/templates/partials/inputDropdown.html', function (html) {
                    partialTemplates.inputDropdown = html;
                }),
                $.get('/esglobe/js/templates/partials/inputNumber.html', function (html) {
                    partialTemplates.inputNumber = html;
                }),
                $.get('/esglobe/js/templates/partials/inputText.html', function (html) {
                    partialTemplates.inputText = html;
                })
            ).then(function () {
                Handlebars.registerPartial('inputDropdown', partialTemplates.inputDropdown);
                Handlebars.registerPartial('inputNumber', partialTemplates.inputNumber);
                Handlebars.registerPartial('inputText', partialTemplates.inputText);
            })

        }
    }

    loadModule(moduleName) {
        // clears the widgets
        $('.widget').html("");

        // clears the emitters
        window.sph.emitter.clear();

        // load the module iframe
        $('#esglobe-menu-frame').find('iframe').attr('src', `./esglobe_modules/${moduleName}`);
        if (typeof window.sph === 'undefined') window.sph = {};
        window.sph.loadedModule = moduleName;
    }

    loadWidget(widgetName, options) {
        const position = options && options.position;
        const col = options && options.col;
        const height = options && options.height;
        const width = options && options.width;

        const sph = this.getSph();
        const moduleName = this._getModuleName();


        const colEl = $(`<div class='col-xs-${col}'></div>`);
        const blankEl = $(`<div></div>`);

        // todo: write a function to clear widgets on module load
        // $(`.widget`, window.parent.document).html("<span></span>");

        if (widgetName) {
            let iframeDiv = "";
            console.log("====loadWidget===", moduleName);
            if (height && width) {
                iframeDiv = `<iframe src="./esglobe_modules/${moduleName}/widgets/${widgetName}/${widgetName}.html" style="height:${height}px; width:${width}px"></iframe>`;
            } else if (height) {
                iframeDiv = `<iframe src="./esglobe_modules/${moduleName}/widgets/${widgetName}/${widgetName}.html" style="height:${height}px"></iframe>`;
            } else {
                iframeDiv = `<iframe src="./esglobe_modules/${moduleName}/widgets/${widgetName}/${widgetName}.html"></iframe>`;
            }
            colEl.append(iframeDiv);
        }
        $(`.widget.${position}`, window.parent.document).append(colEl);
    }

    loadForm(formName, callback) {
        // load the form JSON
        const self = this;
        const moduleName = this._getModuleName();

        $.get(`./forms/${formName}.json`, function (formDefinition) {
            formDefinition.moduleName = moduleName;
            formDefinition.formName = formName;
            console.log("==form definition==", formDefinition);
            self.formBuilder.transformFormModel(formDefinition);

            $.get('/js/templates/formBuilder.hbs', function (template) {
                const html = self.formBuilder.getHtml(formDefinition, template);
                $(`#${formName}`).html(html);

                $(`#${formName}`).find('form').submit(function (e) {
                    e.preventDefault();
                    if ($(this).valid()) {
                        const dataJSON = self._formToJSON($(this));
                        const url = $(this).attr('action');
                        self._runScript(url, dataJSON, callback)
                    }
                })
            })


            /*$.ajax({
                method: "POST",
                url: "/form-builder",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(formDefinition),
                dataType: 'json'
            })
                .done(function (data) {
                    $(`#${formName}`).html(data.html);

                    $(`#${formName}`).find('form').submit(function (e) {
                        e.preventDefault();
                        if ($(this).valid()) {
                            const dataJSON = self._formToJSON($(this));
                            const url = $(this).attr('action');
                            self._runScript(url, dataJSON, callback)
                        }
                    })
                });*/
        })
    }

    runScript(scriptName, params, callback) {
        const moduleName = this._getModuleName();
        const url = `/api/${moduleName}/script`;
        if (typeof params === 'undefined') params = {};
        params.scriptName = scriptName;

        $.ajax({
            method: "POST",
            url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            dataType: 'json'
        })
            .done(function (data) {
                if (_.isFunction(callback)) callback(data);
            })

    }

    show(resource) {
        const sph = this.getSph();
        const moduleName = this._getModuleName();
        let url;
        if (resource.indexOf('/') !== -1 || resource.indexOf('\\') !== -1) {
            url = `/fs?url=${resource}`;
        } else
            url = `./esglobe_modules/${moduleName}/graphics/${resource}`;
        sph.show(url);
    }



    /** Private Functions **/

    /**
     *
     * @param form: a jquery form
     * @returns {{}}
     * @private
     */
    _formToJSON(form) {
        let dataString = form.serializeArray();
        const dataJSON = {};
        _.forEach(dataString, val => {
            dataJSON[val.name] = val.value;
        });
        return dataJSON;
    }

    getSph() {
        return window.parent.sph;
    }

    _getModuleName () {
        const sph = window.parent.sph;
        const moduleName = sph && sph.loadedModule;
        return moduleName;
    }

    _runScript(url, params, callback) {
        $.ajax({
            method: "POST",
            url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            dataType: 'json'
        })
            .done(function (data) {
                if (_.isFunction(callback)) callback(data);
            })

    }
}

function resizeIframe(obj) {
    $(document).ready(function () {
        $(obj).css('display', 'block');
        // obj.style.height = obj.contentWindow.document.body.scrollHeight - 50 + 'px';
    });
}