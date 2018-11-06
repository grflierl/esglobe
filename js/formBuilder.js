class FormBuilder {
    constructor() {

    }

    transformFormModel(model) {
        let count = 0;
        let row = {};
        const modelArray = [];

        _.forEach(model.form, (val, key) => {
            if(count !== 0 && count % 12 === 0) {
                modelArray.push(row);
                row = {};
            }
            row[key] = val;
            count += Number(val.col);
        });
        if(!_.isEmpty(row)) {
            modelArray.push(row);
        }
        model.rows = modelArray;
        _.forEach(model.rows, row => {
            _.forEach(row, (val, key) => {
                const self = this;

                // default autocomplete to "off" if it doesn't exist.
                if(!val.autocomplete) {
                    val.autocomplete = "off";
                }
                // process associations
                if (val.association && (val.type === "dropdown" || val.type === 'multiselect')) {
                    if (model.associations[val.association] && _.isFunction(model.associations[val.association].then)) {
                        model.associations[val.association].then(result => {
                            val.data = result;
                            val.dropdown = this._processDropdown(val);
                            if (val.associationAs) val.label = val.associationAs;
                        });
                    }
                }

                // create a label if it doesn't exist
                if (!val.label) val.label = this._camelCaseConvert(key);
                val.name = key;

                // process any dropdowns if they exist
                if (val.type === "dropdown" || val.type === 'typeahead') {
                    // is the data a promise?

                    if (val.data && typeof val.data.then === "function") {
                        this.isLoading = true;

                        val.data
                            .then(result => {
                                val.data = result;
                                val.dropdown = this._processDropdown(val);
                                this.isLoading = false;
                            });
                    } else {
                        val.dropdown = this._processDropdown(val);
                    }
                }

                // text value override, support promises, or sync
                if (["text", "number", "hidden"].indexOf(val.type) !== -1 && val.value) {
                    this._resolveValue(val, key);
                }

                if (val.type === "typeahead") {
                    // by default set typeahead-editable to false
                    if (typeof val.typeaheadEditable === "undefined") val.typeaheadEditable = false;

                    if (typeof val.template === "undefined") val.template = null;
                }

                if (val.array) {
                    // if it's an array, instantiate a count variable
                    if (typeof val.arrayCount === "undefined") val.arrayCount = 1;
                    this.input[val.name] = [];
                }

                // set default column width if it doesn't exist
                if (typeof val.col === "undefined" || !val.col) {
                    val.col = 12;
                }

                if (val.type === "date" && this.input[key]) {
                    this.input[key] = new Date(moment(this.input[key]).format("YYYY-MM-DD") + " 12:00:00Z");
                }

                if (val.type === "image") {
                    // if the association key exists, set it to the input key to show the image
                    if (val.association) {
                        this.input[key] = (this.input[val.association] && [this.input[val.association]]) || null;
                    }
                }

                console.log("==model data==", model.data, val);
                if (model.data && model.data[val.name]) {
                    val.value = model.data[val.name];
                }
            });
        });
        // set the default primary key, if none exists
        if (typeof model.primaryKey === "undefined") {
            model.primaryKey = "_id";
        }

        return model;
    }

    getHtml(formModel, template) {
        const hbTemplate = Handlebars.compile(template);
        const html = hbTemplate(formModel);

        return html
    }

    _camelCaseConvert(input) {
        const result = input.replace(/([A-Z])/g, " $1");
        const finalResult = result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.
        return finalResult;
    }

    _processDropdown(input) {
        const output = [];
        // if (typeof input.map === "undefined") return [];
        if (_.isArray(input.data)) {
            _.forEach(input.data, row => {
                let outputDao;
                if (_.isObject(row)) {
                    if (typeof input.map === 'undefined') return;
                    outputDao = row;
                    if (!input.map.label.match("{{")) {
                        outputDao.label = row[input.map.label] || null;
                    } else {
                        // compile handlebars
                        outputDao.label = hbs.compile(input.map.label)(row);
                    }

                    outputDao.value = row[input.map.value] || null;
                } else if (_.isString(row) || _.isNumber(row)) {
                    outputDao = {
                        label: row,
                        value: row
                    };
                }

                output.push(outputDao);

            });

            if (input.default) {
                this.input[input.name] = input.default;
            }
        }

        if (this.input) {
            const dropdownMatch = _.find(output, item => {
                // convert any numbers to string so they can be directly compared;
                let inputVal = this.input[input.name];
                if (_.isNumber(inputVal)) {
                    inputVal = this.input[input.name].toString();
                }

                let itemVal = item.value;
                if (_.isNumber(itemVal)) itemVal = itemVal.toString();

                return itemVal === inputVal;
            });

            if (dropdownMatch) {
                this.input[input.name] = dropdownMatch;
            }
        }

        return output;
    }

}

