export type YoutubeDownloadOptions = {
  useChromeCookies?: boolean;
};

export type YtdlpFailureCode =
  | "YOUTUBE_PRIVATE"
  | "YOUTUBE_COOKIES_FAILED"
  | "DOWNLOAD_FAILED";

export const buildYtdlpArgs = (opts: {
  url: string;
  outputTemplate: string;
  ffmpegPath?: string | null;
  denoPath?: string | null;
  useChromeCookies?: boolean;
}): string[] => [
  "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
  "--merge-output-format", "mp4",
  "-o", opts.outputTemplate,
  "--no-playlist",
  "--newline",
  ...(opts.ffmpegPath ? ["--ffmpeg-location", opts.ffmpegPath] : []),
  ...(opts.denoPath ? ["--js-runtimes", `deno:${opts.denoPath}`] : []),
  ...(opts.useChromeCookies ? ["--cookies-from-browser", "chrome"] : []),
  "--",
  opts.url,
];

export const classifyYtdlpFailure = (output: string): YtdlpFailureCode => {
  const text = output.toLowerCase();
  const cookieCopyFailed =
    (text.includes("cookie") &&
      (text.includes("could not copy") ||
        text.includes("could not find") ||
        text.includes("failed to load") ||
        text.includes("database is locked") ||
        text.includes("failed to decrypt"))) ||
    text.includes("failed to decrypt cookies");
  if (cookieCopyFailed) return "YOUTUBE_COOKIES_FAILED";

  const needsAccount =
    text.includes("private video") ||
    text.includes("this video is private") ||
    text.includes("sign in if you've been granted") ||
    text.includes("login required") ||
    text.includes("please sign in") ||
    text.includes("sign in to confirm") ||
    text.includes("members-only") ||
    text.includes("members only") ||
    text.includes("join this channel");
  if (needsAccount) return "YOUTUBE_PRIVATE";

  return "DOWNLOAD_FAILED";
};
