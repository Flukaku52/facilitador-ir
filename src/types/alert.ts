export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface TaxAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedGuideSlug?: string;
}
