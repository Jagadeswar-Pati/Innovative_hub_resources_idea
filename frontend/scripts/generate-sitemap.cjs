/**
 * Rewrites public/sitemap.xml base URL from VITE_APP_URL in .env (or fallback).
 * Run before build: node scripts/generate-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

const fallback = 'https://inovative-hub.com';
let base = fallback;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/VITE_APP_URL=(.+)/);
  if (m && m[1]) {
    base = m[1].trim().replace(/\/$/, '');
  }
}

if (!fs.existsSync(sitemapPath)) {
  console.warn('scripts/generate-sitemap.cjs: public/sitemap.xml not found');
  process.exit(0);
}

let xml = fs.readFileSync(sitemapPath, 'utf8');
xml = xml.replace(/https:\/\/inovative-hub\.com/g, base);
fs.writeFileSync(sitemapPath, xml);
console.log('Sitemap base URL set to:', base);
