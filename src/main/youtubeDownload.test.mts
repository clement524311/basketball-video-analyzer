import { test } from "node:test";
import assert from "node:assert/strict";
import { buildYtdlpArgs, classifyYtdlpFailure } from "./youtubeDownload.ts";

test("passes Chrome cookies to yt-dlp only when asked", () => {
  const withCookies = buildYtdlpArgs({
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    outputTemplate: "/tmp/%(title)s.%(ext)s",
    useChromeCookies: true,
  });
  assert.deepEqual(
    withCookies.slice(withCookies.indexOf("--cookies-from-browser"), withCookies.indexOf("--")),
    ["--cookies-from-browser", "chrome"]
  );

  const without = buildYtdlpArgs({
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    outputTemplate: "/tmp/%(title)s.%(ext)s",
  });
  assert.equal(without.includes("--cookies-from-browser"), false);
});

test("classifies private-video and cookie-read failures", () => {
  assert.equal(
    classifyYtdlpFailure("ERROR: [youtube] abc: Private video. Sign in if you've been granted access to this video"),
    "YOUTUBE_PRIVATE"
  );
  assert.equal(
    classifyYtdlpFailure("ERROR: [chrome] Could not copy Chrome cookie database"),
    "YOUTUBE_COOKIES_FAILED"
  );
  assert.equal(
    classifyYtdlpFailure("ERROR: Failed to decrypt cookies"),
    "YOUTUBE_COOKIES_FAILED"
  );
  assert.equal(classifyYtdlpFailure("ERROR: HTTP Error 403"), "DOWNLOAD_FAILED");
});
