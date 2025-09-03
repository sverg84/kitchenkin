import { imageCreateHandler } from "@/lib/lambda";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const image = data.get("image") as File | null;

  if (!image) {
    return NextResponse.json("No image provided", { status: 400 });
  }

  const encoded = Buffer.from(await image.arrayBuffer()).toString("base64");

  const lambdaResponse = await imageCreateHandler({
    fileName: image.name,
    fileType: image.type,
    encoded,
  });

  return NextResponse.json(lambdaResponse);
}
