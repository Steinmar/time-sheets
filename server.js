// var Utility = require('./utility.js')

class Utility {
    static getDateStr(parsedConsoleParams) {
        let today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        let year = today.getFullYear();

        if (parsedConsoleParams.d) {
            day = parsedConsoleParams.d;
        }

        if (parsedConsoleParams.m) {
            month = parsedConsoleParams.m;
        }

        if (parsedConsoleParams.y) {
            year = parsedConsoleParams.y;
        }

        if (day.toString().length < 2) {
            day = '0' + day;
        }

        if (month.toString().length < 2) {
            month = '0' + month;
        }

        return `${year}-${month}-${day}`;
    }

    static getActualCommits(commitsArr, strDate) {
        return commitsArr.filter((commit) => {
            return commit.date.includes(strDate) && commit.author_name === authorName && !commit.message.includes('Merge');
        });
    }

    static getFirstAndLastCommitsTime(commitsArr) {
        let firstCommitTime;
        let lastCommitTime;

        commitsArr.map((commit) => {
            if (firstCommitTime > commit.date || !firstCommitTime) {
                firstCommitTime = commit.date;
            }

            if (lastCommitTime < commit.date || !lastCommitTime) {
                lastCommitTime = commit.date;
            }
        });

        return {firstCommitTime, lastCommitTime};
    }

    static getParsedCommitsMessages(commitsArr) {
        return commitsArr.map((commit) => {
            const message = commit.message;
            let start = message.indexOf('(');
            const end = message.indexOf(')');

            if (start - 1 > 0 && message.charAt(start - 1) === ' ') {
                start--;
            }
            const newMessage = message.substring(0, start) + message.substring(end + 1, message.length);

            return Object.assign({}, commit, { message: newMessage });
        });
    }

    static getSummaryText(commitsArr) {
        let summaryText = '';
        commitsArr.map((commit) => {
            let message = commit.message;

            message = message.replaceAt(0, message.charAt(0).toUpperCase()) + '. ';
            summaryText += message;
        });

        return summaryText.replaceAt(summaryText.length - 1, '');
    }

    static parseConsoleParams (consoleParams, valueSeparator = '=') {
        const keys = ['d', 'm', 'y'];
        let parsedParams = {};

        consoleParams.forEach((consoleElement, consoleKey) => {
            keys.forEach((avialableKey) => {
                if (consoleElement.includes(avialableKey)) {
                    parsedParams[avialableKey] = consoleElement.substr(consoleElement.indexOf(valueSeparator) + 1);
                }
            });
        });
        return parsedParams;
    }
}

// module.exports.Utility = Utility;

let workingDirPath = '../ivengo';
let simpleGit = require('simple-git')(workingDirPath);

const authorName = 'Alex Rybak';
// const branchName = 'new-styles-2';
const branchName = 'development';
let hasNeededBranchResolve;
let hasNeededBranchReject;

let hasNeededBranch = new Promise((resolve, reject) => {
    hasNeededBranchResolve = resolve;
    hasNeededBranchReject = reject;
});

let infoPromiseResolve;
let infoPromiseReject;
let infoPromise = new Promise((resolve, reject) => {
    infoPromiseResolve = resolve;
    infoPromiseReject = reject;
});

const appParams = process.argv.slice(2);
const parsedAppParams = Utility.parseConsoleParams(appParams);

let webdriver = require('selenium-webdriver');
console.log(webdriver.by)
var chrome = require('selenium-webdriver/chrome');
var path = require('./node_modules/chromedriver').path;

let service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

let driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
 
// browser.get('http://en.wikipedia.org/wiki/Wiki');

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

simpleGit.branchLocal((error, branchSummary) => {
    if (branchSummary.all.includes(branchName)) {
        hasNeededBranchResolve(branchName);
    }
});

console.log(parsedAppParams);

hasNeededBranch.then((branchName) => {
    simpleGit.checkout(branchName);
    simpleGit.log(function (err, log) {

        let strDate = Utility.getDateStr(parsedAppParams);
        let allMyTodayActualCommits = Utility.getActualCommits(log.all, strDate);
        let {firstCommitTime, lastCommitTime} = Utility.getFirstAndLastCommitsTime(allMyTodayActualCommits);
        const parsedTodayCommits = Utility.getParsedCommitsMessages(allMyTodayActualCommits)
        const summaryText = Utility.getSummaryText(parsedTodayCommits).replaceAll('\n', '');

        infoPromiseResolve({
            summaryText,
            time: {
                firstCommit: firstCommitTime,
                lastCommit: lastCommitTime
            }
        })
    });
}, (error) => {
    console.log('branch not found!');
});

infoPromise.then((data) => {
    console.log('First commit time: ', data.time.firstCommit)
    console.log('Last commit time: ', data.time.lastCommit);
    console.log('Message: ' + data.summaryText);

    driver.get('https://docs.google.com/a/mpsdevelopment.com/forms/d/e/1FAIpQLSfq3LLOlDamzMt0_sxF2m_UrOst10X4GBc8NtdUEz8TKZrmUQ/viewform');
    let select = driver.findElement(webdriver.By.tagName('select')).sendKeys('Rybak');
    let textarea = driver.findElement(webdriver.By.tagName('textarea')).sendKeys(data.summaryText);
});
