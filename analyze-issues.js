var path = require('path');
var _ =  require('underscore');
var chalk = require('chalk');

var cacheIssues = require('./cache-issues');

var commands = {};

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

function hasLabel(issue, label) {
  return !!_.findWhere(issue.labels, {name: label});
}

function isPlatformIssue(issue) {
  return hasLabel(issue, 'platform') ||
         hasLabel(issue, 'engineering') ||
         hasLabel(issue, 'bug') ||
         'pull_request' in issue;
}

function isNonPlatformIssue(issue) {
  return !isPlatformIssue(issue);
}

function help(exitcode) {
  console.log("usage: " + path.basename(process.argv[1]) + ' [command]');
  console.log("\ncommands:\n");
  Object.keys(commands).forEach(function(name) {
    console.log('  ' + name, '-', commands[name].help);
  });
  process.exit(exitcode || 0);
}

function main() {
  var arg = process.argv[2];
  var cmd = commands[arg];

  if (['-h', '--help'].indexOf(arg) != -1) return help();
  if (!cmd) return help(1);
  cmd.run();
}

commands['linked'] = {
  help: 'show non-platform issues linking to other issues',
  run: function() {
    cacheIssues.getAllCachedIssues()
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
  }
};

if (!module.parent) {
  main();
}
