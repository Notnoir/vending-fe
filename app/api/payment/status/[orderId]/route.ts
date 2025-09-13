import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// Initialize Core API client
const core = new midtransClient.CoreApi({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR_SERVER_KEY",
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check if we have valid Midtrans credentials
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey || serverKey === "SB-Mid-server-YOUR_SERVER_KEY") {
      // Demo mode - return mock response
      console.log("Demo mode: Returning mock payment status for:", orderId);

      const mockStatus = {
        _mock: true,
        order_id: orderId,
        transaction_status: "pending",
        transaction_time: new Date().toISOString(),
        payment_type: "qris",
        fraud_status: "accept",
        status_code: "201",
        status_message: "Transaction is pending",
        gross_amount: "0",
      };

      // Simulate different statuses based on order ID pattern for testing
      if (orderId.includes("success") || orderId.includes("paid")) {
        mockStatus.transaction_status = "settlement";
        mockStatus.status_code = "200";
        mockStatus.status_message = "Transaction is successful";
      } else if (orderId.includes("failed") || orderId.includes("deny")) {
        mockStatus.transaction_status = "deny";
        mockStatus.status_code = "400";
        mockStatus.status_message = "Transaction is denied";
      }

      return NextResponse.json(mockStatus);
    }

    try {
      // Check transaction status with real Midtrans
      const statusResponse = await core.transaction.status(orderId);
      return NextResponse.json(statusResponse);
    } catch (midtransError: unknown) {
      console.error("Midtrans API error:", midtransError);

      // Always fallback to demo mode if Midtrans fails (for development)
      console.log("Falling back to demo mode due to Midtrans error");
      const mockStatus = {
        _mock: true,
        order_id: orderId,
        transaction_status: "pending",
        transaction_time: new Date().toISOString(),
        payment_type: "qris",
        fraud_status: "accept",
        status_code: "201",
        status_message: "Transaction is pending (demo mode)",
        gross_amount: "0",
      };

      return NextResponse.json(mockStatus);
    }
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
