// src/contexts/DatabaseContext.tsx
import { eq, like, or } from "drizzle-orm";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db, initializeDb } from "../db";
import { NewProduct, products, type Product } from "../db/schema";

interface DatabaseContextType {
  isDbReady: boolean;
  products: Product[];
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  getProduct: (id: number) => Promise<Product | undefined>;
  searchProducts: (value: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

const expodb = SQLite.openDatabaseSync("sennada.sdb");

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  useDrizzleStudio(expodb);
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDb();
        await refreshData();
        setIsDbReady(true);
      } catch (error) {
        console.error("Database setup failed:", error);
      }
    };

    setupDatabase();
  }, []);

  const refreshData = async () => {
    try {
      const allProducts = await db.select().from(products);
      setProductsList(allProducts);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const addProduct = async (product: NewProduct) => {
    try {
      await db.insert(products).values(product);
      await refreshData();
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await db.update(products).set(product).where(eq(products.id, product.id));

      await refreshData();
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  const getProduct = async (id: number): Promise<Product | undefined> => {
    try {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);
      return product[0];
    } catch (error) {
      console.error("Failed to get product:", error);
      return undefined;
    }
  };

  const searchProducts = async (value: string): Promise<void> => {
    try {
      const productsList = await db
        .select()
        .from(products)
        .where(
          or(
            eq(products.barcode, value),
            like(products.ref, value),
            like(products.title, value)
          )
        );

      setProductsList(productsList);
    } catch (error) {
      console.error("Failed to search products:", error);
      return undefined;
    }
  };

  const value: DatabaseContextType = {
    isDbReady,
    products: productsList,
    addProduct,
    updateProduct,
    getProduct,
    searchProducts,
    refreshData,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
