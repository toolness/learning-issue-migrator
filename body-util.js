var _ =  require('underscore');

var ISSUE_RE = /(\s|^)\#(\d+)/g;
var USERNAME_RE = /(\s|^)\@([A-Za-z0-9\-]+)/g;

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

function replaceIssue(issue, regex, fn) {
  issue.body = issue.body.replace(regex, fn);
  issue.comments.forEach(function(comment) {
    comment.body = comment.body.replace(regex, fn);
  });

  return issue;
}

exports.replaceLinkedIssues = function(issue, fn) {
  return replaceIssue(issue, ISSUE_RE, function(match, space, i) {
    return space + fn(i);
  });
};

exports.replaceUsernameMentions = function(issue, fn) {
  return replaceIssue(issue, USERNAME_RE, function(match, space, user) {
    return space + fn(user);
  });
};

exports.findLinkedIssues = function(issue) {
  var linkedIssues = scanIssue(issue, ISSUE_RE).map(function(m) {
    return m.trim();
  });

  linkedIssues = _.uniq(linkedIssues);

  return linkedIssues;
};
