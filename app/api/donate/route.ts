import { NextResponse } from 'next/server';

interface DonationRequestBody {
  name: string;
  email: string;
  amount: string;
  paymentMethod: 'mpesa' | 'card';
  phoneNumber?: string;
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
}

export async function POST(request: Request) {
  try {
    const body: DonationRequestBody = await request.json();
    const { name, email, amount, paymentMethod, phoneNumber, cardName, cardNumber, expiry, cvc } = body;

    // 1. Core Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name field is required." }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Donation amount must be a positive number." }, { status: 422 });
    }
    if (!paymentMethod || !['mpesa', 'card'].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method selected." }, { status: 400 });
    }

    // 2. Conditional Payment Method Validation
    if (paymentMethod === 'mpesa') {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneNumber || !phoneRegex.test(phoneNumber.trim())) {
        return NextResponse.json({ error: "Please enter a valid 10-digit M-Pesa number starting with 0 (e.g., 0722777222)." }, { status: 400 });
      }
    }
    
    if (paymentMethod === 'card') {
      if (!cardName || !cardNumber || !expiry || !cvc) {
        return NextResponse.json({ error: "Complete card credentials are required." }, { status: 400 });
      }
    }

    // Simulate real-world network latency (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Payment Gateway Simulation Triggers
    if (parsedAmount === 404) {
      return NextResponse.json(
        { error: "Simulated Error: Gateway connection timeout." }, 
        { status: 502 }
      );
    }

    if (parsedAmount === 408 && paymentMethod === 'mpesa') {
      return NextResponse.json(
        { error: "M-Pesa request timed out. No PIN was entered on your phone." }, 
        { status: 408 }
      );
    }

    const transactionId = `MSF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // 4. Return RESTful Success Response
    return NextResponse.json({
      success: true,
      message: `Thank you, ${name.trim()}! Your donation of KSh ${parsedAmount.toLocaleString()} via ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'} was simulated successfully.`,
      transactionId,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: "An internal system error occurred while processing the request." }, 
      { status: 500 }
    );
  }
}