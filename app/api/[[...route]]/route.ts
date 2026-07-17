import { Hono } from "hono";
import { handle } from "hono/vercel";
import pegawaiRoutes from "./routes/pegawai";
import jabatanRoutes from "./routes/jabatan";
import jabatanPegawaiRoutes from "./routes/jabatanpegawai";
import usersRoutes from "./routes/users";

const app = new Hono().basePath("/api");

app.route("/pegawai", pegawaiRoutes);
app.route("/jabatan", jabatanRoutes);
app.route("/jabatanpegawai", jabatanPegawaiRoutes);
app.route("/users", usersRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
