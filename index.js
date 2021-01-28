const https = require('https')
const core = require('@actions/core')
const parseText = require("./parseText");
const { readFileSync } = require("fs");

const snoowrap = require('snoowrap');
const { Octokit } = require("@octokit/action");
const toolkit = require("@actions/core");

const VERSION = require("../package.json").version;

console.log(`Running twitter-together version ${VERSION}`);

class Main {
  constructor() {
    // Auth
    this.username = core.getInput('username', { required: true })
    this.password = core.getInput('password', { required: true })
    this.appId = core.getInput('app-id', { required: true })
    this.appSecret = core.getInput('app-secret', { required: true })

    // Post
    this.subreddit = core.getInput('subreddit', { required: true })
    this.title = core.getInput('title', { required: true })
    this.flairId = core.getInput('flair-id')
    this.flairText = core.getInput('flair-text')

    // Comment
    this.comment = core.getInput('comment')

    // Others
    this.notification = core.getInput('notification') === 'true'
    this.retryRateLimit = +core.getInput('retry-rate-limit')
    this.userAgent = `Release for Reddit (by /u/${this.username})`

    // Will be init by function below since it's async
    this.accessToken = ''
  }

  // The main logic here
  async start() {

    const octokit = new Octokit();

    const payload = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
    );
    const ref = process.env.GITHUB_REF;
    const sha = process.env.GITHUB_SHA;

    const state = {
      toolkit,
      octokit,
      payload,
      ref,
      sha,
      startedAt: new Date().toISOString(),
    };
    // find tweets
    const newPosts = await parseText(state);
    if (newPosts.length === 0) {
      toolkit.info("No new posts");
      return;
    }
    this.text = newPosts[0].text
    console.log(this.text)

    // NOTE: The following examples illustrate how to use snoowrap. However, hardcoding
    // credentials directly into your source code is generally a bad idea in practice (especially
    // if you're also making your source code public). Instead, it's better to either (a) use a separate
    // config file that isn't committed into version control, or (b) use environment variables.


    // Alternatively, just pass in a username and password for script-type apps.
    const otherRequester = new snoowrap({
      userAgent: this.userAgent,
      clientId: this.appId,
      clientSecret: this.appSecret,
      username: this.username,
      password: this.password
    });

    // That's the entire setup process, now you can just make requests.

    // Submitting a link to a subreddit
    r.getSubreddit('test').submitSelfpost({
      title: 'Mt. Cameramanjaro',
      text: this.text
    });
  }

}

new Main().start().catch(e => core.setFailed(e.message))
