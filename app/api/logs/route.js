import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Log from "@/models/Log";

export async function GET(req) {
  try {
    await dbConnect();

    await Log.updateMany(
      { isSold: { $exists: false } },
      { $set: { isSold: false } }
    );

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const availableOnly = searchParams.get("availableOnly") === "true";

    const filter = {
      ...(platform ? { platform: platform.toLowerCase() } : {}),
      ...(availableOnly ? { isSold: false } : {}),
    };

    const logs = await Log.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
