import { verifyAdmin } from "@/lib/verifyAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await dbConnect();

  const users = await User.find().lean();

  return Response.json(users);
}
