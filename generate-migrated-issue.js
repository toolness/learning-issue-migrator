var fs = require('fs');
var _ = require('underscore');

var cacheIssues = require('./cache-issues');
var bodyUtil = require('./body-util');

var template = _.template(fs.readFileSync(__dirname + '/issue-template.md',
                                          'utf-8'));

function generate(issue) {
  var newIssue = {
    title: issue.title,
    labels: _.pluck(issue.labels, 'name')
  };

  if (issue.assignee) {
    newIssue.assignee = issue.assignee.login;
  }

  bodyUtil.replaceLinkedIssues(issue, function(i) {
    // Link to the original ticket in the original repo, since the
    // issue number will likely be different in the new repo being
    // migrated to.
    return cacheIssues.GITHUB_REPO + '#' + i;
  });

  bodyUtil.replaceUsernameMentions(issue, function(username) {
    // We don't want GitHub emailing users about being mentioned when
    // migrating these issues, so munge the mention.
    return '**@****' + username + '**';
  });

  newIssue.body = template({
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
  });

  return newIssue;
}

module.exports = generate;

if (!module.parent) {
  require('./issue-cmd').run(function(issue) {
    console.log(generate(issue));
  });
}
