import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") return null;

    return decoded; 
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}
