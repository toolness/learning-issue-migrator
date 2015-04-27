var chalk = require('chalk');

function issueDesc(issue) {
  return chalk.white.bold('#' + issue.number) + ' ' +
         chalk.gray('(' + issue.title + ')');
}

exports.issueDesc = issueDesc;
