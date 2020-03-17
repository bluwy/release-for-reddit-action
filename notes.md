# Notes

Nothing to see here, just me taking notes of Reddit's API.

Example submit post result:

```js
{
  json: {
    errors: [],
    data: {
      url: 'https://www.reddit.com/r/test/comments/fjlsg1/test/',
      drafts_count: 0,
      id: 'fjlsg1',
      name: 't3_fjlsg1'
    }
  }
}
```

Example comment result:

```js
{
  json: {
    errors: [],
    data: {
      things: [
        {
          kind: 't1',
          data: {
            total_awards_received: 0,
            approved_at_utc: null,
            edited: false,
            mod_reason_by: null,
            banned_by: null,
            author_flair_type: 'text',
            removal_reason: null,
            link_id: 't3_fjlsg1',
            author_flair_template_id: null,
            likes: true,
            replies: '',
            user_reports: [],
            saved: false,
            id: 'fknmyow',
            banned_at_utc: null,
            mod_reason_title: null,
            gilded: 0,
            archived: false,
            no_follow: false,
            author: 'bludevonly',
            can_mod_post: false,
            created_utc: 1584369549,
            send_replies: true,
            parent_id: 't3_fjlsg1',
            score: 1,
            author_fullname: 't2_5xputz7x',
            approved_by: null,
            mod_note: null,
            all_awardings: [],
            subreddit_id: 't5_2qh23',
            body: 'this is a comment',
            awarders: [],
            author_flair_css_class: null,
            name: 't1_fknmyow',
            author_patreon_flair: false,
            downs: 0,
            author_flair_richtext: [],
            is_submitter: true,
            body_html: '&lt;div class="md"&gt;&lt;p&gt;this is a comment&lt;/p&gt;\n' +
              '&lt;/div&gt;',
            gildings: {},
            collapsed_reason: null,
            distinguished: null,
            associated_award: null,
            stickied: false,
            author_premium: false,
            can_gild: false,
            subreddit: 'test',
            author_flair_text_color: null,
            score_hidden: false,
            permalink: '/r/test/comments/fjlsg1/test/fknmyow/',
            num_reports: null,
            locked: false,
            report_reasons: null,
            created: 1584398349,
            author_flair_text: null,
            rte_mode: 'markdown',
            collapsed: false,
            subreddit_name_prefixed: 'r/test',
            controversiality: 0,
            author_flair_background_color: null,
            collapsed_because_crowd_control: null,
            mod_reports: [],
            subreddit_type: 'public',
            ups: 1
          }
        }
      ]
    }
  }
}
```
