var Readable = require('stream').Readable;
var util = require('util');

var request = require('request');
var parseLinkHeader = require('parse-link-header');

function GithubIssueStream(options) {
  Readable.call(this, {
    objectMode: true
  });
  this._cachedIssues = [];
  this._nextURL = 'https://api.github.com/repos/' + options.repo +
                  '/issues';
  this.options = options;
}

util.inherits(GithubIssueStream, Readable);

GithubIssueStream.prototype._fetchMoreIssues = function() {
  var self = this;
  var options = this.options;

  request({
    url: this._nextURL,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': options.userAgent
    },
    auth: {
      user: options.user,
      pass: options.pass
    }
  }, function(err, res, body) {
    if (err) {
      return self.emit('error', err);
    }

    if (res.statusCode != 200) {
      return self.emit('error', new Error("got HTTP " + res.statusCode));
    }

    body = JSON.parse(body);

    var link = parseLinkHeader(res.headers['link']);

    self._nextURL = link && link.next && link.next.url;
    self._cachedIssues.push.apply(self._cachedIssues, body);
    self._read();
  });
};

GithubIssueStream.prototype._read = function() {
  if (this._cachedIssues.length) {
    this.push(this._cachedIssues.shift());
  } else if (!this._nextURL) {
    this.push(null);
  } else {
    this._fetchMoreIssues();
  }
};

module.exports = GithubIssueStream;
