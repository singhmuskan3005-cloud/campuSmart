"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "Books",
  "Electronics",
  "Home & Living",
  "Fashion",
  "Sports",
  "Other",
];

const conditions = [
  "Brand New",
  "Like New",
  "Good",
  "Fair",
];

export default function Page() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log({
      title,
      description,
      price,
      category,
      condition,
    });

    alert("Listing created successfully!");

    router.push("/listings");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
          Sell an Item
        </h1>

        <p className="text-muted-foreground">
          Create a listing and sell your item to students on campus.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium"
          >
            Item Title
          </label>

          <input
            id="title"
            type="text"
            placeholder="e.g. Scientific Calculator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            placeholder="Describe your item..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
            rows={5}
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="price"
            className="text-sm font-medium"
          >
            Price (₹)
          </label>

          <input
            id="price"
            type="number"
            min="0"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              required
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                Select category
              </option>

              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="condition"
              className="text-sm font-medium"
            >
              Condition
            </label>

            <select
              id="condition"
              value={condition}
              onChange={(e) =>
                setCondition(e.target.value)
              }
              required
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                Select condition
              </option>

              {conditions.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Create Listing
        </button>
      </form>
    </div>
  );
}