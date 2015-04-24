var through = require('through');

var PagedEntityStream = require('./paged-entity-stream');

var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
var GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

var GITHUB_REPO = 'mozilla/teach.webmaker.org';
var USER_AGENT = 'learning-issue-migrator on behalf of ' +
                 'GitHub user ' + GITHUB_USERNAME;

var issueStream = new PagedEntityStream({
  userAgent: USER_AGENT,
  url: 'https://api.github.com/repos/' + GITHUB_REPO + '/issues',
  user: GITHUB_USERNAME,
  pass: GITHUB_PASSWORD
});

var issueWithCommentsStream = issueStream.pipe(through(function(issue) {
  var self = this;

  var allComments = [];
  var comments = new PagedEntityStream({
    userAgent: USER_AGENT,
    url: 'https://api.github.com/repos/' + GITHUB_REPO +
         '/issues/' + issue.number + '/comments',
    user: GITHUB_USERNAME,
    pass: GITHUB_PASSWORD
  });

  comments.on('data', function(comment) {
    allComments.push(comment);
  });
  comments.on('end', function() {
    issue.comments = allComments;
    self.emit('data', issue);
    self.resume();
  });
  self.pause();
}));

issueWithCommentsStream.on('data', function(issue) {
  console.log(issue);
});
