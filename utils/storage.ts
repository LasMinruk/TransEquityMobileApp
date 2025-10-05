import AsyncStorage from '@react-native-async-storage/async-storage';

export type Review = {
  id: string;
  city: string;
  vehicleType: 'bus' | 'train' | 'tram' | 'ferry' | 'other';
  rating: number;
  reviewText: string;
  timestamp: number; // ms epoch
  userId: string;
};

const REVIEWS_KEY = 'reviews';
const USERS_KEY = 'users';

export async function getReviews(): Promise<Review[]> {
  const raw = await AsyncStorage.getItem(REVIEWS_KEY);
  return raw ? (JSON.parse(raw) as Review[]) : [];
}

export async function setReviews(reviews: Review[]) {
  await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export async function addReview(review: Omit<Review, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) {
  const list = await getReviews();
  const full: Review = {
    id: review.id ?? String(Date.now()),
    timestamp: review.timestamp ?? Date.now(),
    ...review,
  } as Review;
  list.unshift(full);
  await setReviews(list);
  return full;
}

export async function updateReview(updated: Review) {
  const list = await getReviews();
  const next = list.map((r) => (r.id === updated.id ? updated : r));
  await setReviews(next);
}

export async function deleteReview(id: string) {
  const list = await getReviews();
  const next = list.filter((r) => r.id !== id);
  await setReviews(next);
}

export async function getUsersRaw<T = any[]>(): Promise<T> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as T) : ([] as unknown as T);
}

export async function setUsersRaw<T = any[]>(users: T) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function canEditOrDelete(timestamp: number): boolean {
  const FIFTEEN_MIN_MS = 15 * 60 * 1000;
  return Date.now() - timestamp < FIFTEEN_MIN_MS;
}


