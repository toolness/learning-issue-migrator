var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var cacheIssues = require('./cache-issues');

var template = _.template(fs.readFileSync(__dirname + '/issue-template.md',
                                          'utf-8'));

function main() {
  var issueNumber = parseInt(process.argv[2]);

  if (isNaN(issueNumber)) {
    console.log("usage: " + path.basename(process.argv[1]) + " <issue>");
    process.exit(1);
  }

  var issue = cacheIssues.getCachedIssue(issueNumber);

  console.log(template({
    issue: issue,
    originalIssueLink: cacheIssues.GITHUB_REPO + '#' + issue.number,
    niceDate: function(date) {
      return new Date(date).toDateString();
    },
    quoted: function(content) {
      return content.split('\n').map(function(line) {
        return '> ' + line;
      }).join('\n');
    },
    userLink: function(user) {
      return '[' + user.login + '](' + user.url + ')';
    }
  }));
}

if (!module.parent) {
  main();
}