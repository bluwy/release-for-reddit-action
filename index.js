const https = require('https')
const core = require('@actions/core')

class Main {
  constructor() {
    // Auth
    this.username = core.getInput('username', {
      required: true
    })
    this.password = core.getInput('password', {
      required: true
    })
    this.appId = core.getInput('app-id', {
      required: true
    })
    this.appSecret = core.getInput('app-secret', {
      required: true
    })

    // Post
    this.subreddit = core.getInput('subreddit', {
      required: true
    })
    this.title = core.getInput('title', {
      required: true
    })
    this.url = core.getInput('url', {
      required: true
    })
    this.flairId = core.getInput('flair-id')
    this.flairText = core.getInput('flair-text')

    // Comment
    this.comment = core.getInput('comment')

    // Others
    this.retryRateLimit = +core.getInput('retry-rate-limit')
    this.userAgent = `Release for Reddit (by /u/${this.username})`

    // Will be init by function below since it's async
    this.accessToken = ''
  }

  // The main logic here
  async start() {
    await this.initAccessToken()

    const postData = await this.submitPost()

    core.info(`View post at ${postData.url}`)
    core.setOutput('postUrl', postData.url)

    if (this.comment) {
      const commentData = await this.commentPost(postData.name)

      const commentUrl = `https://www.reddit.com${commentData.permalink}`

      core.info(`View comment at ${commentUrl}`)
      core.setOutput('commentUrl', commentUrl)
    }
  }

  async initAccessToken() {
    const result = await this._post(
      {
        host: 'www.reddit.com',
        path: '/api/v1/access_token',
        auth: `${this.appId}:${this.appSecret}`
      },
      {
        grant_type: 'password',
        username: this.username,
        password: this.password
      }
    )

    this.accessToken = result['access_token']
  }

  async submitPost() {
    const result = await this._retryIfRateLimit(async () => {
      const r = await this._post(
        {
          host: 'oauth.reddit.com',
          path: `/api/submit`,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        },
        {
          api_type: 'json',
          resubmit: true,
          kind: 'link',
          sr: this.subreddit,
          title: this.title,
          url: this.url,
          flair_id: this.flairId,
          flair_text: this.flairText
        }
      )

      // Check error here so we can retry if hit rate limit.
      // Reddit returns code 200 for rate limit for some reason.
      if (r.json.errors.length) {
        throw new Error(r.json.errors)
      }

      return r
    })

    return result.json.data
  }

  async commentPost(postId) {
    const result = await this._retryIfRateLimit(async () => {
      const r = await this._post(
        {
          host: 'oauth.reddit.com',
          path: `/api/comment`,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        },
        {
          api_type: 'json',
          text: this.comment,
          thing_id: postId
        }
      )

      // Check error here so we can retry if hit rate limit.
      // Reddit returns code 200 for rate limit for some reason.
      if (r.json.errors.length) {
        throw new Error(r.json.errors)
      }

      return r
    })

    const resultData = result.json.data

    if (resultData && resultData.things && resultData.things[0]) {
      return resultData.things[0].data
    }

    return resultData
  }

  _post(options, data) {
    const postData = this._encodeForm(data)

    const reqOptions = {
      ...options,
      method: 'POST',
      headers: {
        ...options.headers,
        'User-Agent': this.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    return new Promise((resolve, reject) => {
      const req = https.request(reqOptions, res => {
        res.setEncoding('utf8')

        let data = ''

        res.on('data', chunk => {
          data += chunk
        })
        res.on('error', e => reject(e))
        res.on('end', () => resolve(JSON.parse(data)))
      })

      req.on('error', e => reject(e))
      req.write(postData)
      req.end()
    })
  }

  /**
   * Retry function again if hit rate limit
   * @param {Function} fn
   * @param {number} retryCount The number of retries. If 0, will not retry again.
   * @returns The return type of fn
   */
  async _retryIfRateLimit(fn, retryCount = 1) {
    try {
      return await fn()
    } catch (e) {
      const rateLimit = this._getRateLimitSeconds(e.message)

      if (rateLimit > 0 && retryCount > 0) {
        core.info(`Rate limit hit. Waiting ${rateLimit} seconds to retry...`)

        await this._wait(rateLimit * 1000)

        return await this._retryIfRateLimit(fn, retryCount - 1)
      }

      throw e
    }
  }

  _getRateLimitSeconds(errorMessage) {
    // This is a very naive way of overcoming the RATELIMIT but I have no choice
    const matchMessage = errorMessage.match(
      /RATELIMIT.*try again in (\d*) (s|m)/
    )

    if (!matchMessage || matchMessage.length < 3) {
      return -1
    }

    let rateLimitSeconds = matchMessage[1]

    if (matchMessage[2] === 'm') {
      // Convert minute to seconds
      rateLimitSeconds *= 60
    }

    // Add 1 minute as buffer, just in case
    rateLimitSeconds += 60

    return rateLimitSeconds
  }

  async _wait(ms) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), ms)
    })
  }

  _encodeForm(data) {
    return Object.entries(data)
      .map(v => v.map(encodeURIComponent).join('='))
      .join('&')
  }
}

new Main().start().catch(e => core.setFailed(e.message))
