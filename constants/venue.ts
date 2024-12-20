import type { VenueLocation } from '~/types/venue'

export const venueLocations: VenueLocation[] = [
  {
    id: 'hq',
    text: 'HQ：大會報到處',
    carouselImage: '/venue/venue-highlight-hq.svg',
    isOpen: true,
  },
  {
    id: 'i',
    text: 'Ｉ 棟：交流攤位',
    url: '/venue/venue-map-i.png',
    isOpen: true,
  },
  {
    id: 'a',
    text: 'A 棟：議程廳',
    url: '/venue/venue-map-a.png',
    carouselImage: '/venue/venue-highlight-i.svg',
    isOpen: true,
  },
  {
    id: 'f',
    text: 'F 棟：議程廳',
    url: '/venue/venue-map-f.png',
    carouselImage: '/venue/venue-highlight-f.svg',
    isOpen: true,
  },
  {
    id: 'm',
    text: 'M 棟：議程廳',
    url: '/venue/venue-map-m.png',
    carouselImage: 'venue-highlight-m.svg',
    isOpen: true,
  },
  {
    id: 'b',
    text: 'B 棟：未開放',
    isOpen: false,
  },
  {
    id: 'a1',
    text: 'A1 棟：未開放',
    isOpen: false,
  },
  {
    id: 'g',
    text: 'G 棟：未開放',
    isOpen: false,
  },
]
