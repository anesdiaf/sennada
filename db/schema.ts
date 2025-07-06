import { sql } from "drizzle-orm";
import { integer, real, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

export const products = table(
    "products", {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    ref: text(),
    barcode: text(),
    title: text(),
    detailPrice: real(),
    wholesalePrice: real(),
    semiWSPrice: real(),
    stock: real(),
    isFollowStock: integer({ mode: "boolean" }),
    base64Data: text('base64_data'),
    mimeType: text('mime_type'),
    size: integer('size'),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull()
}
)


export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;