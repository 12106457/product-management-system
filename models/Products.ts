import mongoose, { Schema, models, model } from "mongoose";

export interface IProduct extends mongoose.Document {
  title: string;
  description?: string;
  imageUrl?: string;
  status: string;
  date: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    status: { type: String, enum: ["active", "inactive"], required: true },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
