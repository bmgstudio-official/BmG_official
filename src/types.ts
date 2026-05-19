export interface PageConfig {
  id: number;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  externalLink?: string;
  styles: {
    titleColor: string;
    descriptionColor: string;
    titleSize: string;
    descriptionSize: string;
    fontFamily: string;
  };
}

export interface SiteConfig {
  logoUrl: string;
  backgroundColor: string;
  pages: PageConfig[];
}
