import { useEffect } from 'react';
import { SchemaMarkup } from '@/lib/seo-utils';

interface SchemaMarkupInjectorProps {
  schema: SchemaMarkup;
  id?: string;
}

/**
 * Component to inject JSON-LD schema markup into page head
 * Automatically cleans up when component unmounts
 */
export default function SchemaMarkupInjector({ schema, id = 'schema-markup' }: SchemaMarkupInjectorProps) {
  useEffect(() => {
    // Create or update script element
    let scriptElement = document.querySelector(`script[data-schema-id="${id}"]`) as HTMLScriptElement;
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-schema-id', id);
      document.head.appendChild(scriptElement);
    }
    
    // Inject schema
    scriptElement.textContent = JSON.stringify(schema);
    
    // Cleanup
    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.remove();
      }
    };
  }, [schema, id]);

  // This component doesn't render anything visible
  return null;
}
