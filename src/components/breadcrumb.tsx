import { Link } from 'react-router-dom';
import { generateBreadcrumbSchema, BreadcrumbItem } from '@/lib/seo-utils';
import { useEffect } from 'react';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Inject breadcrumb schema markup
  useEffect(() => {
    const schema = generateBreadcrumbSchema(items);
    let scriptElement = document.querySelector('script[data-breadcrumb-schema]') as HTMLScriptElement;
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-breadcrumb-schema', 'true');
      document.head.appendChild(scriptElement);
    }
    
    scriptElement.textContent = JSON.stringify(schema);
    
    return () => {
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [items]);

  return (
    <nav className={`flex items-center gap-2 text-xs md:text-sm text-muted-foreground ${className}`}>
      {items.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">/</span>}
          {index === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link 
              to={item.path} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
