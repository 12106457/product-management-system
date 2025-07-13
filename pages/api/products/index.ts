import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const product = await Product.create(req.body);
      return res.status(201).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  if (req.method === "GET") {
    try {
      const { status, startDate, endDate } = req.query;

      const filter: any = {};

      if (status) {
        filter.status = (status as string).toLowerCase();
      }

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
          filter.date.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.date.$lte = new Date(endDate as string);
        }
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
