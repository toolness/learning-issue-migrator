var fs = require('fs');
var path = require('path');
var _ =  require('underscore');
var chalk = require('chalk');

var CACHE_DIR = path.join(__dirname, 'cache');

function scanIssue(issue, regex) {
  var matches = [];
  var findMatches = function(content) {
    var match = content.match(regex);

    if (match) {
      matches.push.apply(matches, match);
    }
  }

  findMatches(issue.body);
  issue.comments.forEach(function(comment) {
    findMatches(comment.body);
  });

  return matches;
}

function findLinkedIssues(issue) {
  var ISSUE_RE = /(?:\s|^)\#(\d+)/g;
  var linkedIssues = scanIssue(issue, ISSUE_RE).map(function(m) {
    return m.trim();
  });

  linkedIssues = _.uniq(linkedIssues);

  return linkedIssues;
}

function isPlatformIssue(issue) {
  return !!_.findWhere(issue.labels, {name: "platform"});
}

function isNonPlatformIssue(issue) {
  return !isPlatformIssue(issue);
}

function loadIssue(filename) {
  var abspath = path.join(CACHE_DIR, filename);
  return JSON.parse(fs.readFileSync(abspath));
}

fs.readdirSync(CACHE_DIR)
  .sort()
  .map(loadIssue)
  .filter(isNonPlatformIssue)
  .forEach(function(issue) {
    var linkedIssues = findLinkedIssues(issue);

    if (linkedIssues.length) {
      console.log(chalk.white.bold('#' + issue.number),
                  chalk.gray('(' + issue.title + ')'),
                  "links to issue(s)", 
                  linkedIssues.map(function(i) {
                    return chalk.cyan(i);
                  }).join(', ') + ".");
    }
  });
