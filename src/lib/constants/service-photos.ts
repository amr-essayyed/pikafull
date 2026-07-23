export interface ServicePhotos {
  before: string
  after: string
}

export const DEFAULT_SERVICE_PHOTOS: Record<string, ServicePhotos> = {
  "regular": {
    before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  },
  "regular-cleaning": {
    before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  },
  "deep": {
    before: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
  },
  "deep-cleaning": {
    before: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
  },
  "end-of-tenancy": {
    before: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
  },
  "office": {
    before: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
  },
  "office-cleaning": {
    before: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
  },
  "after-party-cleaning": {
    before: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
  },
  "carpet-cleaning": {
    before: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
  },
}

export function getServicePhotos(service: { slug?: string; before_image_url?: string; after_image_url?: string }): ServicePhotos {
  if (service.before_image_url && service.after_image_url) {
    return {
      before: service.before_image_url,
      after: service.after_image_url,
    }
  }

  const slug = service.slug?.toLowerCase() || ""
  if (DEFAULT_SERVICE_PHOTOS[slug]) {
    return DEFAULT_SERVICE_PHOTOS[slug]
  }

  // Generic fallback if slug is unknown
  return {
    before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  }
}
