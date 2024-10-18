import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { format } from "https://deno.land/std@0.91.0/datetime/mod.ts";

abstract class Logger {
    public static log(msg: string) {
        console.log(format(new Date(), "yyyy-MM-dd HH:mm:ss"), "|", msg);
    }

    public static error(msg: string, ...errs: unknown[]) {
        console.error(
            format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "|",
            msg,
            ...errs,
        );
    }
}
interface Item {
    id: string;
    name: string;
    shortName: string;
    basePrice: number;
    lastLowPrice: number;
}

const MONGO_CONNECTION_URI = Deno.env.get("MONGO_CONNECTION_URI");
if (!MONGO_CONNECTION_URI) {
    Logger.error("Missing MONGO_CONNECTION_URI in env vars");
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
            Logger.error("Error fetching items:");
            return null;
        }

        const data = await response.json();

        if (data.errors) {
            Logger.error(
                "Errors fetching items from tarkov.dev:",
                data.errors,
            );
            return null;
        }

        Logger.log("Items fetched");

        return data.data.items.filter((item: Item) =>
            item.lastLowPrice !== null
        );
    } catch (error) {
        Logger.error(
            "Fetch failed:",
            error,
        );
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
        Logger.log(`${items.length} items upserted`);
    } catch (error) {
        Logger.error(
            "Error inserting items:",
            error,
        );
    }
}

const items = await fetchItems();
if (items) {
    await insertItems(items);
} else {
    Logger.error(
        "No items fetched, skipping...",
    );
}

client.close();
