import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function generateThumbnailUrl(url: string): string {
  try {
    const encodedUrl = encodeURIComponent(url);
    // Using a free screenshot service - you can replace with your preferred service
    // Alternative services: screenshotmachine.com, screenshotapi.net, etc.
    return `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodedUrl}&width=800&height=600&fresh=true`;
  } catch {
    return '';
  }
}

export function getPlaceholderThumbnail(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    // Generate a simple gradient placeholder based on domain
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 50%);stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 70%, 40%);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">${domain}</text>
      </svg>
    `)}`;
  } catch {
    return '';
  }
}

// Utility to check if a domain is likely to block iframe embedding (X-Frame-Options: SAMEORIGIN or DENY)
export function isLikelyCSPBlocked(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const blockedDomains = [
      'google.com',
      'github.com',
      'stackoverflow.com',
      'medium.com',
      'twitter.com',
      'x.com',
      'facebook.com',
      'linkedin.com',
      'instagram.com',
      'reddit.com',
      'amazon.com',
      'netflix.com',
      'apple.com',
      'microsoft.com',
      'youtube.com',
      't.co',
      'bit.ly',
      'wikipedia.org',
      'quora.com',
      'notion.so',
      'figma.com',
      'slack.com',
      'discord.com'
    ];
    return blockedDomains.some(d => domain === d || domain.endsWith('.' + d));
  } catch {
    return false;
  }
}

