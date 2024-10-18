import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

interface Item {
    id: string;
    name: string;
    shortName: string;
    basePrice: number;
    lastLowPrice: number;
}

const MONGO_CONNECTION_URI = Deno.env.get("MONGO_CONNECTION_URI");
if (!MONGO_CONNECTION_URI) {
    console.error("Missing MONGO_CONNECTION_URI in env vars");
    Deno.exit(1);
}

const client = new MongoClient();
await client.connect(MONGO_CONNECTION_URI);
const db = client.database();
const collection = db.collection<Item>("items");

async function fetchItems(): Promise<Array<Item> | null> {
    const query = `
    query {
      items {
        id
        name
        shortName
        basePrice
        lastLowPrice
      }
    }
  `;

    try {
        const response = await fetch("https://api.tarkov.dev/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            console.error("Error fetching items:", response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.errors) {
            console.error(
                "Errors fetching items from tarkov.dev:",
                data.errors,
            );
            return null;
        }

        console.log("Items fetched");

        return data.data.items.filter((item: Item) =>
            item.lastLowPrice !== null
        );
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

async function insertItems(items: Array<Item>) {
    try {
        await Promise.all(
            items.map((item) =>
                collection.updateOne(
                    { id: item.id },
                    { $set: item },
                    { upsert: true },
                )
            ),
        );
        console.log(`${items.length} items upserted`);
    } catch (error) {
        console.error("Error inserting items:", error);
    }
}

const items = await fetchItems();
if (items) {
    await insertItems(items);
} else {
    console.error("No items fetched, skipping...");
}

client.close();
