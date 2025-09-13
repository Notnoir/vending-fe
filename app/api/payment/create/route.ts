import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR_SERVER_KEY",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      items,
    } = body;

    // Validate required fields
    if (!orderId || !amount || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare transaction details
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail || "customer@vendingmachine.com",
        phone: customerPhone || "08123456789",
      },
      item_details: items.map(
        (item: {
          id: string;
          price: number;
          quantity: number;
          name: string;
        }) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
        })
      ),
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
    };

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment transaction" },
      { status: 500 }
    );
  }
}
