CREATE TABLE Users(
  id text PRIMARY KEY NOT NULL,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  phone text UNIQUE,
  address text UNIQUE,
  prof_pic text,
  referral_code text NOT NULL UNIQUE,
  referrer_id text references users(id),
  permalink text,
  verify_token text,
  verified BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE Platforms(
  id text PRIMARY KEY,
  user_id text references users(id) NOT NULL,
  platform_id text NOT NULL,
  platform_type VARCHAR NOT NULL,
  unique (platform_id, platform_type)
);

CREATE TABLE PromoBlacklist(
  user_id text references users(id) NOT NULL
);

CREATE TABLE Upvotes(
  id text PRIMARY KEY,
  user_id text references users(id),
  video_id text NOT NULL,
  platform_id text NOT NULL,
  platform_type VARCHAR NOT NULL,
  upvoted BOOLEAN NOT NULL,
  datetime TIMESTAMP NOT NULL
);

CREATE TABLE Blacklist(
  token text PRIMARY KEY NOT NULL
);

CREATE TABLE Views(
  id text PRIMARY KEY,
  user_id text references users(id),
  video_url text NOT NULL,
  video_id text NOT NULL,
  platform_id text NOT NULL,
  platform_type VARCHAR NOT NULL,
  datetime TIMESTAMP NOT NULL
);

CREATE INDEX user_view_id on Views(user_id, video_id);

CREATE TABLE Txs(
  tx_hash TEXT PRIMARY KEY NOT NULL,
  tx_status TEXT NOT NULL,
  tx_type TEXT NOT NULL,
  value TEXT NOT NULL,
  sender_user_id TEXT REFERENCES users(id),
  sender_address TEXT,
  recipient_user_id TEXT REFERENCES users(id),
  recipient_address TEXT,
  recipient_platform_type TEXT,
  recipient_platform_id TEXT,
  message TEXT,
  metadata TEXT,
  datetime TIMESTAMP
);

CREATE INDEX txs_recipient on Txs(recipient_platform_type, recipient_platform_id);

CREATE TABLE refresh_tokens (
  id text PRIMARY KEY,
  token text,
  user_id text,
  client_id text
);

CREATE TABLE access_tokens (
  id text PRIMARY KEY,
  token text,
  user_id text,
  client_id text,
  expires integer
);