var fs = require('fs');
var path = require('path');
var through = require('through');
var zpad = require('zpad');

var PagedEntityStream = require('./paged-entity-stream');

var CACHE_DIR = path.join(__dirname, 'cache');
var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
var GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

var GITHUB_REPO = 'mozilla/teach.webmaker.org';
var USER_AGENT = 'learning-issue-migrator on behalf of ' +
                 'GitHub user ' + GITHUB_USERNAME;

function cacheIssues() {
  return new PagedEntityStream({
    userAgent: USER_AGENT,
    url: 'https://api.github.com/repos/' + GITHUB_REPO + '/issues',
    user: GITHUB_USERNAME,
    pass: GITHUB_PASSWORD
  }).pipe(through(function ignoreIssueIfAlreadyCached(issue) {
    var queue = true;
    var filename = issueFilename(issue);
    var cachedIssue;

    if (fs.existsSync(filename)) {
      cachedIssue = JSON.parse(fs.readFileSync(filename));
      if (Date.parse(issue.updated_at) <=
          Date.parse(cachedIssue.updated_at)) {
        queue = false;
      }
    }

    if (queue) {
      this.queue(issue);
    } else {
      console.log('Skipping issue ' + issue.number + ' (already cached).');
    }
  })).pipe(through(function addCommentsToIssue(issue) {
    var self = this;
    var allComments = [];

    if (issue.comments === 0) {
      issue.comments = [];
      self.emit('data', issue);
      return;
    }

    var comments = new PagedEntityStream({
      userAgent: USER_AGENT,
      url: 'https://api.github.com/repos/' + GITHUB_REPO +
           '/issues/' + issue.number + '/comments',
      user: GITHUB_USERNAME,
      pass: GITHUB_PASSWORD
    }).on('data', function(comment) {
      allComments.push(comment);
    }).on('end', function() {
      issue.comments = allComments;
      self.emit('data', issue);
      self.resume();
    });
    self.pause();
  })).on('data', function cacheIssue(issue) {
    console.log('Caching issue ' + issue.number + '.');
    fs.writeFileSync(issueFilename(issue), JSON.stringify(issue, null, 2));
  });
}

function issueFilename(issue) {
  var ZPAD_AMOUNT = 3;
  return path.join(CACHE_DIR, zpad(issue.number, ZPAD_AMOUNT) + '.json');
}

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

if (!module.parent) {
  cacheIssues();
}
