const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');

class ScriptExecuter {
    constructor(moduleName, scriptName, params) {
        this._scriptPath = `${__dirname}/../esglobe_modules/${moduleName}/scripts`;
        this._scriptName = scriptName;
        this._moduleName = moduleName;
        this._params = this._extractParams(params);

        if (fs.existsSync(`${this._scriptPath}/${this._scriptName}`)) {
            this._engine = this._getEngine(scriptName);
        }
    }


    async runScript(scriptName, params) {
        delete params.scriptName;
        switch(this._engine) {
            case 'python':
                return await this._execPythonAsync(scriptName, params);
                break;
            default:
                return Promise.reject("No engine detected");
        }
    }

    /** Private Functions **/
    _extractParams(params) {
        if (_.isObject(params)) {
            return params;
        }
    }

    _getEngine(scriptName) {
        const ext = this._getExtension(scriptName);
        switch (ext) {
            case 'py': {
                return 'python';
            }
        }
    }

    _getExtension(filename) {
        return _.last(filename.split('.'));
    }

    async _execPythonAsync(scriptName, params) {
        const PythonShell = require('python-shell');
        return new Promise((resolve, reject) => {
            const args = this._pythonFormatParams(params);

            const self = this;
            PythonShell.run(scriptName, { scriptPath: this._scriptPath, args, mode: 'json' }, function (err, results) {
                if (err) return reject(err);
                else return resolve({ engine: self._engine, results: results[0]});
            })
        })
    }

    _pythonFormatParams(params) {
        const args = [];
        _.forEach(params, (value, key) => {
            args.push(`--${key}`);
            args.push(value);
        });

        return args;
    }
}

module.exports = ScriptExecuter;