import { getDb, getSqlite } from "../src/db/client";

getDb();

const counts = {
  courses: (getSqlite().prepare("SELECT COUNT(*) AS count FROM courses").get() as { count: number }).count,
  modules: (getSqlite().prepare("SELECT COUNT(*) AS count FROM modules").get() as { count: number }).count,
  lessons: (getSqlite().prepare("SELECT COUNT(*) AS count FROM lessons").get() as { count: number }).count,
  resources: (getSqlite().prepare("SELECT COUNT(*) AS count FROM resources").get() as { count: number }).count,
};

console.log(JSON.stringify(counts, null, 2));
