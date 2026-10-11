import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { SITE } from './layout';
import { breedPages, renderBreedPage, renderBreedIndex } from './breeds';
import { ARTICLES, articlePath, renderArticle, renderArticleIndex } from './articles';

// Writes the static SEO pages (/porodi/…, /statii/…) and sitemap.xml into dist after the build.
export const seoPagesPlugin = (): Plugin => {
  let outDir = 'dist';
  return {
    name: 'edog-seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const write = (urlPath: string, html: string) => {
        const file = path.join(outDir, urlPath, 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
      };

      const breeds = breedPages();
      write('/porodi/', renderBreedIndex(breeds));
      for (const b of breeds) write(b.path, renderBreedPage(b, breeds));

      write('/statii/', renderArticleIndex());
      for (const a of ARTICLES) write(articlePath(a), renderArticle(a));

      const today = new Date().toISOString().slice(0, 10);
      const urls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/register', priority: '0.6', changefreq: 'monthly' },
        { loc: '/statii/', priority: '0.8', changefreq: 'weekly' },
        ...ARTICLES.map(a => ({ loc: articlePath(a), priority: '0.8', changefreq: 'monthly', lastmod: a.published })),
        { loc: '/porodi/', priority: '0.8', changefreq: 'monthly' },
        ...breeds.map(b => ({ loc: b.path, priority: '0.7', changefreq: 'monthly', lastmod: today })),
        { loc: '/privacy.html', priority: '0.2', changefreq: 'yearly' },
      ];
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls
            .map(u => `  <url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
            .join('\n') +
          `\n</urlset>\n`
      );
      console.log(`SEO pages: ${breeds.length} breeds, ${ARTICLES.length} articles, ${urls.length} sitemap URLs`);
    },
  };
};
