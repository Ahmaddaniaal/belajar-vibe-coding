import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL || "mysql://root:root@127.0.0.1:3306/belajar_vibe_coding",
});

export const db = drizzle(connection, { schema, mode: "default" });
export type DbType = typeof db;
