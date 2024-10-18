# Tarkov Items Fetcher

A Deno script that fetches Escape from Tarkov items from the [api.tarkov.dev](https://api.tarkov.dev), filters them to include only items that are not banned on the flea market, and stores the filtered data in a MongoDB database.

## Features
- Fetches items from the Tarkov API.
- Filters out items that are banned on the flea market.
- Stores the filtered items in a MongoDB collection.

## Requirements
- **Deno**: Ensure you have [Deno](https://deno.land/) installed.
- **MongoDB**: A MongoDB instance (local or cloud).

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/Dr-Greg/tarkov-flea-items-fetcher
    cd tarkov-flea-items-fetcher
    ```

2. Set up environment variables:
   - Create a `.env` file with the following:
     ```bash
     MONGODB_URI=your_mongodb_connection_string
     ```

3. Install the required dependencies:
    ```bash
    make
    ```

## Usage

1. Run the script:
    ```bash
    tarkov-flea-items-fetcher
    ```

2. The script will fetch the items, filter out the banned ones, and store the rest in the MongoDB collection.

## API Reference

- **api.tarkov.dev**: The public API used to fetch Tarkov items. More information can be found at their [API documentation](https://api.tarkov.dev/docs).

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
