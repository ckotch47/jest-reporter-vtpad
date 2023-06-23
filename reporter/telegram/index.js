const TelegramBot = require('node-telegram-bot-api');
const {
    duration,
    formatTitle, red, green, yellow, magenta, cyan, formatTitleForTG,
} = require('./lib/utils');


const { log } = console;

class JestTelegramReporter {
    botToken;
    chatId;
    name;
    text = '';
    logged = ['passed', 'failed', 'pending', 'unknown'];
    bot;

    console = true;
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;

        const temp = process.cwd().split('/');
        this.name = this._options.name ?? temp[temp.length-1];
        this.text += `${this.name} \n`

        if(this._options.logged && this._options.logged.length > 0){
            this.logged = this._options.logged
        }
        if(!this._options.botToken || !this._options.chatId){
            throw new Error('not chat or token')
        }
        this.botToken = this._options.botToken;
        this.chatId = this._options.chatId;
        this.bot = new TelegramBot(this.botToken, { polling: false });


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

        let { ancestorTitles, status, title, duration, fullName } = testResult;
        const currentTitle = ancestorTitles[titlesIndex];
        if (!currentTitle) {
            // if past the end of ancestorTitles, go back one index
            await this.recursivelyReport(prevTitle, testResults, ++resultsIndex, --titlesIndex);

            if(this.console)
                log(formatTitle(status, title), cyan(duration > 0 ? `${duration}ms` : `<1ms`));

            await this.addToText(status, fullName)
            return;
        }

        if (prevTitle !== currentTitle && titlesIndex < ancestorTitles.length) {
            // if new title encountered and not yet at the end of ancestorTitles, check next ancestorTitle
            if(this.console)
                log(magenta(`suite: ${currentTitle}`));

            await this.recursivelyReport(currentTitle, testResults, resultsIndex, ++titlesIndex);
        } else {
            // otherwise log actual test and go onto next test
            if(this.console)
                log(formatTitle(status, title), cyan(duration > 0 ? `${duration}ms` : `<1ms`));
            await this.addToText(status, fullName)
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
        this.text += `passed/count - ${numPassedTests}/${numPassedTests+numFailedTests+numPendingTests} \n`;

        for(const i of testResults){
            await this.recursivelyReport(i.testFilePath, i.testResults, 0, 0);
            if (i.failureMessage) {
                if(this.console)
                    log(i.failureMessage);
            }
            if(this.console) log()
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

        if(this.console)
            log(this.text);
        try {
            await this.bot.sendMessage(this.chatId, `${this.text}`);
        }catch (e) {
            log(e);
        }

    }

    async addToText(status, title){
        if(this.logged.includes(status)){
            this.text += formatTitleForTG(status, title);
        }
    }
}

module.exports = JestTelegramReporter;