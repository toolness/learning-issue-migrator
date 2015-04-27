This issue has been migrated from <%= originalIssueLink %>.

It was originally written by <%= userLink(issue.user) %> on <%= niceDate(issue.created_at) %> and had the following description:

<%= quoted(issue.body) %>

<% issue.comments.forEach(function(comment) { %>
On <%= niceDate(comment.created_at) %>, <%= userLink(comment.user) %> commented:

<%= quoted(comment.body) %>

<% }); %>
