CREATE TABLE IF NOT EXISTS "sessions" (
    "sid" TEXT NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS = FALSE);

ALTER TABLE "sessions"
ADD CONSTRAINT "pk_session" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");
