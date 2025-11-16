import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import Log from "@/models/Log";

// Update log
export async function PUT(req, context) {
  await dbConnect();

  const { id } = await context.params;
  const data = await req.json();

  try {
    const updatedLog = await Log.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Log updated successfully",
      log: updatedLog,
    });
  } catch (error) {
    console.error("Error updating log:", error);
    return NextResponse.json(
      { error: "Failed to update log" },
      { status: 500 }
    );
  }
}

// Delete log
export async function DELETE(req, context) {
  await dbConnect();

  const { id } = await context.params;

  try {
    const deleted = await Log.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json(
      { error: "Failed to delete log" },
      { status: 500 }
    );
  }
}
