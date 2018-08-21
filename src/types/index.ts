export type User = {
  name: string;
  avatarColor: string;
  avatarText: string;
};

export type Song = {
  id: number;
  name: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  playTime?: number;
};

export type Message = {
  user: User;
  message: string;
};
