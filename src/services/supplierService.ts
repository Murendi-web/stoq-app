import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Supplier } from "../types";

const suppliersCol = (shopId: string) => collection(db, "shops", shopId, "suppliers");

export async function addSupplier(shopId: string, data: Omit<Supplier, "supplierId" | "shopId">) {
  const ref = await addDoc(suppliersCol(shopId), { ...data, shopId });
  return ref.id;
}

export async function updateSupplier(shopId: string, supplierId: string, data: Partial<Supplier>) {
  await updateDoc(doc(db, "shops", shopId, "suppliers", supplierId), data);
}

export async function deleteSupplier(shopId: string, supplierId: string) {
  await deleteDoc(doc(db, "shops", shopId, "suppliers", supplierId));
}

export function subscribeToSuppliers(shopId: string, onChange: (suppliers: Supplier[]) => void) {
  const q = query(suppliersCol(shopId), orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => ({ supplierId: d.id, ...d.data() } as Supplier)));
  });
}
