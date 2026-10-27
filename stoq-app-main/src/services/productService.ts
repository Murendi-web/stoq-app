import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Product } from "../types";

const productsCol = (shopId: string) => collection(db, "shops", shopId, "products");

/** FR2: add a new stock item. */
export async function addProduct(shopId: string, data: Omit<Product, "productId" | "shopId">) {
  const ref = await addDoc(productsCol(shopId), { ...data, shopId });
  return ref.id;
}

/** FR2 / FR10: edit an existing product, including its reorder threshold. */
export async function updateProduct(shopId: string, productId: string, data: Partial<Product>) {
  await updateDoc(doc(db, "shops", shopId, "products", productId), data);
}

export async function deleteProduct(shopId: string, productId: string) {
  await deleteDoc(doc(db, "shops", shopId, "products", productId));
}

/**
 * FR5: live-subscribes to the stock list so the dashboard and stock screens
 * update immediately after a sale or restock, on any device signed into the
 * same shop. Search/filter by name or category is done client-side on the
 * returned array — the product count for a single small shop is expected to
 * stay small enough that this is simpler than building Firestore text search.
 */
export function subscribeToProducts(shopId: string, onChange: (products: Product[]) => void) {
  const q = query(productsCol(shopId), orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((d) => ({ productId: d.id, ...d.data() } as Product));
    onChange(products);
  });
}
