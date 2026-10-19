import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Shop } from "../types";

export async function getShop(shopId: string): Promise<Shop | null> {
  const snap = await getDoc(doc(db, "shops", shopId));
  return snap.exists() ? (snap.data() as Shop) : null;
}