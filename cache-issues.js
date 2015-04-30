var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var _ = require('underscore');
var through = require('through');
var zpad = require('zpad');

var PagedEntityStream = require('./paged-entity-stream');

var CACHE_DIR = path.join(__dirname, 'cache');
var GITHUB_REPO = 'mozilla/teach.webmaker.org';

function getAllCachedIssues() {
  return fs.readdirSync(CACHE_DIR)
    .sort()
    .map(function(filename) {
      var abspath = path.join(CACHE_DIR, filename);
      return JSON.parse(fs.readFileSync(abspath));
    });
}

function getLatestUpdate() {
  var latestUpdate = _.max(getAllCachedIssues()
    .map(function(issue) {
      return Date.parse(issue.updated_at);
    }));

  return latestUpdate > 0 ? latestUpdate : 0;
}

function cacheIssues(since) {
  var qs = {'state': 'all'};

  if (typeof(since) == 'undefined') {
    since = getLatestUpdate();
  }
  if (since) {
    qs.since = new Date(since).toISOString();
    console.log("Fetching only issues updated since " + qs.since + ".");
  }

  return new PagedEntityStream({
    url: 'https://api.github.com/repos/' + GITHUB_REPO + '/issues?' +
         querystring.stringify(qs)
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
      url: 'https://api.github.com/repos/' + GITHUB_REPO +
           '/issues/' + issue.number + '/comments'
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

function getCachedIssue(number) {
  return JSON.parse(fs.readFileSync(issueFilename({number: number})));
}

module.exports.createCacheIssueStream = cacheIssues;
module.exports.getAllCachedIssues = getAllCachedIssues;
module.exports.getCachedIssue = getCachedIssue;
module.exports.GITHUB_REPO = GITHUB_REPO;

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

if (!module.parent) {
  if (['-h', '--help'].indexOf(process.argv[2]) != -1) {
    console.log("usage: " + path.basename(process.argv[1]) +
                " [last-update-date|0]");
  } else {
    cacheIssues(process.argv[2] || getLatestUpdate());
  }
}
