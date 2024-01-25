import { NextResponse } from "next/server";
import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";

export async function POST(req: Request) {
  const formData = await req.formData();
  try {
    // Convertir ReadableStream a Buffer
    const imageFile = formData.get("image");
    const format = formData.get("format") as
      | keyof FormatEnum
      | AvailableFormatInfo;
    const buffer = await readAsBuffer(imageFile as File);

    console.log(format);

    // Procesar la imagen con Sharp
    const sharpConf = await sharp(buffer).toFormat(format).toBuffer();

    // Configurar los encabezados de la respuesta
    const headers = new Headers();
    headers.set("Content-Type", `image/${format}`);
    headers;

    // Devolver la imagen convertida como respuesta
    return new NextResponse(sharpConf, {
      status: 200,
      statusText: "OK",
      headers,
    });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse(null, { status: 500, statusText: "FAIL" });
  }
}

async function readAsBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
