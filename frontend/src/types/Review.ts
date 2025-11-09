export interface RatingSet {
  views: number;
  location: number;
  amenities: number;
  overall: number;
}

export interface Review {
  _id: string;
  ratings: RatingSet;
  comment: string;
  userId: string;
  userName?: string;
  createdAt: string;
}
