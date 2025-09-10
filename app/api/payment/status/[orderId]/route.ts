import { NextRequest, NextResponse } from "next/server";

const midtransClient = require("midtrans-client");

// Initialize Core API client
const core = new midtransClient.CoreApi({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR_SERVER_KEY",
});

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check transaction status
    const statusResponse = await core.transaction.status(orderId);

    return NextResponse.json(statusResponse);
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
