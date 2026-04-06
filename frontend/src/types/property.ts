export interface Property {
  id: number;
  title: string;
  price: number;
  lat: number;
  lng: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  image: string;
}

export interface FilterState {
  search: string;
  minPrice?: number;
  maxPrice?: number;
}