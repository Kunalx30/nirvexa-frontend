import { useEffect } from 'react';

export default function SEO({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Nyrvexa`;
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} | Nyrvexa`);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${title} | Nyrvexa`);
    }
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
      
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
