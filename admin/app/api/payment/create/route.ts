import axios, { AxiosError } from "axios";
import { getMulticardToken } from "@/lib/utils/multicard";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ChekoutUrlResponseType } from "./create-checkout-response.type";
import { $Enums } from "@/app/generated/prisma";
import prisma from "@/lib/prisma";
import { createOrder } from "../../orders/create-order";

function validateBody(body: Record<string, any>) {
  if (!body.userId) {
    return null;
  }
  if (!body.order.items.length) {
    return null;
  }

  return {
    userId: body.userId,
    order: body.order
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = validateBody(await req.json());
    if (!body) {
      return NextResponse.json(
        {
          error: "Invalid credentials"
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: body.userId } });

    if (!user?.first_name || !user?.createdAt || !user?.phone) {
      return NextResponse.json(
        {
          checkout_url: null
        },
        { status: 200 }
      );
    }

    const payload = {
      store_id: process.env.MULTICARD_STORE_ID,
      amount: Number(process.env.FIX_PRICE) * 100,
      invoice_id: randomUUID(),
      callback_url: process.env.MULTICARD_CALBACK_URL,
    };

    const token = await getMulticardToken();
    const response = await axios.post(process.env.MULTICARD_URL!, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = response.data as ChekoutUrlResponseType;
    console.info({ request_body: payload, response_data: response.data });

    if (!data.success) {
      return NextResponse.json(null, { status: 400 });
    }

    const order = await createOrder({ userId: body.userId, body });

    await prisma.transaction.create({
      data: {
        invoiceId: payload.invoice_id,
        externalId: data.data.uuid,
        userId: body.userId,
        amount: payload.amount,
        status: $Enums.TransactionStatus.pending,
        orderId: order.id
      }
    });

    return NextResponse.json(
      {
        checkout_url: data.data.checkout_url
      },
      { status: 200 }
    );
  } catch (e) {
    const error = e as AxiosError;
    console.info({ error: error });
    return NextResponse.json(
      {
        checkout_url: null
      },
      { status: 200 }
    );
  }
}
