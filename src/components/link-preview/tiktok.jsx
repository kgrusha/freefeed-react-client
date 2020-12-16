import { useEffect, useState } from 'react';
import cachedFetch from './cached-fetch';

const TIKTOK_VIDEO_RE = /^https?:\/\/(?:www\.)?tiktok\.com\/@.+?\/video\/(\d+)/i;
const TIKTOK_SHORT_VIDEO_RE = /^https?:\/\/vm\.tiktok\.com\/(\w+)/i;

export function canShowURL(url) {
  return TIKTOK_VIDEO_RE.test(url) || TIKTOK_SHORT_VIDEO_RE.test(url);
}

export default function TikTokVideoPreview({ url }) {
  const [id, setId] = useState(() => TIKTOK_VIDEO_RE.exec(url)?.[1]);
  const [isError, setIsError] = useState(false);
  const [byline, setByline] = useState(null);

  useEffect(() => {
    cachedFetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`).then((data) => {
      if (data.title) {
        setByline(`${data.title} by ${data.author_name}`);
        setId(/data-video-id="(\d+)"/.exec(data.html)?.[1]);
      } else {
        setIsError(true);
      }
    });
  }, [url]);

  if (isError) {
    return (
      <div className="link-preview-content">Cannot load TikTok data, probably link is broken.</div>
    );
  }

  if (!id) {
    return (
      <div className="link-preview-content">
        <div className="tiktok-video-preview">Loading preview data…</div>
      </div>
    );
  }

  return (
    <div className="link-preview-content">
      <div className="tiktok-video-preview">
        <iframe
          src={`https://www.tiktok.com/embed/${id}?referrer=https://tiktok.com/`}
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          referrerPolicy="no-referrer"
          importance="low"
          loading="lazy"
          className="tiktok-video-iframe"
        />
      </div>
      {byline && (
        <div className="info">
          <a href={url} target="_blank" title={byline}>
            {byline}
          </a>
        </div>
      )}
    </div>
  );
}
