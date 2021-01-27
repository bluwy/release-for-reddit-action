module.exports = parseText;

const { resolve: resolvePath } = require("path");
const { readFileSync } = require("fs");

async function parseText({ payload, octokit }) {
  const {
    data: { files },
  } = await octokit.request("GET /repos/:owner/:repo/compare/:base...:head", {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    base: payload.before,
    head: payload.after,
  });

  return files
    .filter(
      (file) =>
        file.status === "added" && /^posts\/.*\.posts/.test(file.filename)
    )
    .map((file) => {
      const text = readFileSync(
        resolvePath(process.env.GITHUB_WORKSPACE, file.filename),
        "utf8"
      ).trim();
      return {
        text,
        filename: file.filename,
      };
    });
}
