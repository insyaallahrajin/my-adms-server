import { SQLDatabase } from "encore.dev/storage/sqldb";

export const admsDB = new SQLDatabase("adms", {
  migrations: "./migrations",
});
