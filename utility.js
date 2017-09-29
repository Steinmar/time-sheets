class Utility {
    static getDateStr() {
        let today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        let year = today.getFullYear();

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
            return commit.date.includes(strDate) && commit.author_name === authorName && !commit.message.includes('Merge branch');
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

exports.Utility = Utility;