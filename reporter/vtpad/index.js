const {
    duration,
    formatTitle, formatStatus, red, green, yellow, blue, magenta, cyan,
} = require('./lib/utils');
const axios = require('axios');
const {HttpStatusCode} = require("axios");

const { log } = console;

class JestVtpadReporter {
    testId;
    spaceId;
    suiteId;
    urlReporter;
    name;
    console = true;
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;

        if(!this._options.url || !this._options.space){
            throw new Error('not setting reporter')
        }

        this.spaceId = this._options.space;
        this.urlReporter = this._options.url;

        const temp = process.cwd().split('/');
        this.name = this._options.name ?? temp[temp.length-1];

        this.console = this._options.console ?? true;
    }

    // test start
    async onRunStart ({ numTotalTestSuites }) {
        if(this.console) {
            log();
            log(cyan(`start test ${this.name}`));
            log(cyan(`Found ${numTotalTestSuites} test suites`));
        }
    }


    async recursivelyReport(prevTitle, testResults, resultsIndex, titlesIndex) {
        const testResult = testResults[resultsIndex];

        if (!testResult) {
            // exit at end of testResults array
            return;
        }

        let { ancestorTitles, status, title, duration, failureMessages } = testResult;
        let temp = failureMessages[0];
        if(temp){
            temp = `${temp}`.replace(/(\[[0-9]*m)/gm, '').replace('at', '<br> at');
        }

        const currentTitle = ancestorTitles[titlesIndex];
        if (!currentTitle) {
            // if past the end of ancestorTitles, go back one index
            await this.recursivelyReport(prevTitle, testResults, ++resultsIndex, --titlesIndex);
            duration = duration > 0 ? `${duration}ms` : `<1ms`;
            if(this.console)
                log(formatTitle(status, title), cyan(duration));
            await this.createCase(title, status, temp, duration);

            return;
        }

        if (prevTitle !== currentTitle && titlesIndex < ancestorTitles.length) {
            // if new title encountered and not yet at the end of ancestorTitles, check next ancestorTitle
            if(this.console)
                log(magenta(`suite: ${currentTitle}`));
            await this.createSuite(currentTitle);

            await this.recursivelyReport(currentTitle, testResults, resultsIndex, ++titlesIndex);
        } else {
            // otherwise log actual test and go onto next test
            duration = duration > 0 ? `${duration}ms` : `<1ms`;
            if(this.console)
                log(formatTitle(status, title), cyan(duration));

            await this.createCase(title, status, temp, duration);

            await this.recursivelyReport(currentTitle, testResults, ++resultsIndex, titlesIndex);
        }
    }

    // test end
    async onRunComplete(test, results) {
        const {
            numFailedTests,
            numPassedTests,
            numPendingTests,
            testResults,
            startTime,
        } = results;

        const end = new Date();
        const start = new Date(startTime);

        await this.createTest(this.name, duration(end, start));

        for(const i of testResults){
            await this.recursivelyReport(i.testFilePath, i.testResults, 0, 0);
            if (i.failureMessage) {
                if(this.console)
                log(i.failureMessage);
            }
            if(this.console)
            log();
        }
        if(this.console) {
            if (numPassedTests) {
                log(green(`${numPassedTests} passing`), cyan(`(${duration(end, start)})`));
            }
            if (numFailedTests) {
                log(red(`${numFailedTests} failing`));
            }
            if (numPendingTests) {
                log(yellow(`${numPendingTests} pending`));
            }
        }
    }

    async createTest(name, duration = undefined){
        try {
            const temp = await axios.post(`${this.urlReporter}/test/${this.spaceId}`, {name: name, duration: duration});
            this.testId = temp.data.id;
        }catch (e) {
            log(e)
        }
    }
    async createSuite(name){
        try {
            const temp = await axios.post(`${this.urlReporter}/suite/${this.testId}`, {name: name});
            this.suiteId = temp.data.id;
        }catch (e) {
            log(e);
        }
    }
    async createCase(name, status, message, duration){
        try {
            await axios.post(`${this.urlReporter}/cases/${this.suiteId}`, {
                    name: name,
                    status: formatStatus(status),
                    message: message,
                    duration: duration
                }
            );
        }catch (e) {
            log(e);
        }
    }


}

module.exports = JestVtpadReporter;