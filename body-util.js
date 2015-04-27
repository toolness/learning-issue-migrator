var _ =  require('underscore');

var ISSUE_RE = /(?:\s|^)\#(\d+)/g;

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

exports.findLinkedIssues = function findLinkedIssues(issue) {
  var linkedIssues = scanIssue(issue, ISSUE_RE).map(function(m) {
    return m.trim();
  });

  linkedIssues = _.uniq(linkedIssues);

  return linkedIssues;
};
