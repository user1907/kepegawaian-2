import { relations } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  int,
  decimal,
  mysqlEnum,
  date,
} from "drizzle-orm/mysql-core";

// Better Auth tables
export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role").default("staff"),
});

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Application tables
export const pegawai = mysqlTable(
  "pegawai",
  {
    nip: varchar("nip", { length: 20 }).primaryKey(),
    namaLengkap: varchar("nama_lengkap", { length: 100 }).notNull(),
    jenisKelamin: mysqlEnum("jenis_kelamin", ["L", "P"]).notNull(),
    tanggalLahir: date("tanggal_lahir").notNull(),
    alamat: text("alamat"),
    noHp: varchar("no_hp", { length: 20 }),
    email: varchar("email", { length: 100 }),
    deletedAt: timestamp("deleted_at", { fsp: 3 }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("pegawai_nama_idx").on(table.namaLengkap)],
);

export const jabatan = mysqlTable(
  "jabatan",
  {
    kodeJabatan: varchar("kode_jabatan", { length: 20 }).primaryKey(),
    namaJabatan: varchar("nama_jabatan", { length: 100 }).notNull(),
    level: int("level").notNull(),
    gaji: decimal("gaji", { precision: 15, scale: 2 }).notNull(),
    deletedAt: timestamp("deleted_at", { fsp: 3 }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("jabatan_nama_idx").on(table.namaJabatan)],
);

export const jabatanPegawai = mysqlTable(
  "jabatan_pegawai",
  {
    id: int("id").autoincrement().primaryKey(),
    nip: varchar("nip", { length: 20 })
      .notNull()
      .references(() => pegawai.nip, { onDelete: "restrict" }),
    kodeJabatan: varchar("kode_jabatan", { length: 20 })
      .notNull()
      .references(() => jabatan.kodeJabatan, { onDelete: "restrict" }),
    status: mysqlEnum("status", ["Aktif", "Nonaktif"])
      .notNull()
      .default("Aktif"),
    periode: varchar("periode", { length: 50 }),
    deletedAt: timestamp("deleted_at", { fsp: 3 }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("jp_nip_idx").on(table.nip),
    index("jp_kode_jabatan_idx").on(table.kodeJabatan),
  ],
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const pegawaiRelations = relations(pegawai, ({ many }) => ({
  jabatanPegawai: many(jabatanPegawai),
}));

export const jabatanRelations = relations(jabatan, ({ many }) => ({
  jabatanPegawai: many(jabatanPegawai),
}));

export const jabatanPegawaiRelations = relations(jabatanPegawai, ({ one }) => ({
  pegawai: one(pegawai, {
    fields: [jabatanPegawai.nip],
    references: [pegawai.nip],
  }),
  jabatan: one(jabatan, {
    fields: [jabatanPegawai.kodeJabatan],
    references: [jabatan.kodeJabatan],
  }),
}));
