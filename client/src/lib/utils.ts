import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to handle proxy URLs
export function getImageUrl(url: string): string {
  console.log('getImageUrl called with:', url);
  
  if (!url) {
    console.log('No URL provided, returning placeholder');
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('Full URL detected, returning as-is:', url);
    return url;
  }
  
  // If it's a proxy URL, prefix with API base
  if (url.startsWith('/ai/proxy-image')) {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    const fullUrl = `${API_BASE}${url}`;
    console.log('Proxy URL detected, converted to:', fullUrl);
    return fullUrl;
  }
  
  // If it's a relative path, return as is
  console.log('Relative path detected, returning as-is:', url);
  return url;
}
