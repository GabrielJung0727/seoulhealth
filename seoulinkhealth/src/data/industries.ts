export const INDUSTRIES = [
  {
    id: '01',
    slug: 'care',
    label: 'K-HEALTH CARE',
    position: '0%',
    icon: 'medical-cross',
    description: 'Advanced medical services and global healthcare solutions.',
  },
  {
    id: '02',
    slug: 'industry',
    label: 'K-HEALTH INDUSTRY',
    position: '25%',
    icon: 'industry',
    description: 'Bridging innovation and business across the K-health ecosystem.',
  },
  {
    id: '03',
    slug: 'bio',
    label: 'K-BIO',
    position: '50%',
    icon: 'dna',
    description: 'Pioneering life sciences for a healthier tomorrow.',
  },
  {
    id: '04',
    slug: 'food',
    label: 'K-HEALTH FOOD',
    position: '75%',
    icon: 'leaf',
    description: 'Functional nutrition inspired by Korea’s natural wellness heritage.',
  },
  {
    id: '05',
    slug: 'beauty',
    label: 'K-BEAUTY',
    position: '100%',
    icon: 'beauty',
    description: 'Korean innovation for timeless beauty and total well-being.',
    featured: true,
  },
] as const

export type Industry = (typeof INDUSTRIES)[number]
