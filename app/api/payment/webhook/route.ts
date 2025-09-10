import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the notification for debugging
    console.log("Midtrans notification received:", body);

    // Verify the notification
    const { order_id, transaction_status, fraud_status } = body;

    // Handle different transaction statuses
    switch (transaction_status) {
      case "capture":
        if (fraud_status === "challenge") {
          // Handle challenge fraud status
          console.log("Payment challenged:", order_id);
        } else if (fraud_status === "accept") {
          // Handle successful payment
          console.log("Payment successful:", order_id);
          // TODO: Update order status in database
          // TODO: Trigger vending machine dispensing
        }
        break;

      case "settlement":
        // Payment settled
        console.log("Payment settled:", order_id);
        // TODO: Update order status in database
        // TODO: Trigger vending machine dispensing
        break;

      case "pending":
        // Payment pending
        console.log("Payment pending:", order_id);
        // TODO: Update order status in database
        break;

      case "deny":
        // Payment denied
        console.log("Payment denied:", order_id);
        // TODO: Update order status in database
        break;

      case "cancel":
      case "expire":
        // Payment cancelled or expired
        console.log("Payment cancelled/expired:", order_id);
        // TODO: Update order status in database
        break;

      default:
        console.log("Unknown transaction status:", transaction_status);
    }

    // Return OK status to Midtrans
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
