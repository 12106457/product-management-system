import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching product" });
    }
  }

  if (req.method === "PUT") {
    try {
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error updating product" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error deleting product" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
