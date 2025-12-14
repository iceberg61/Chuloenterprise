import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin")
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  await dbConnect();
  const users = await User.find().lean();

  return Response.json(users);
}
