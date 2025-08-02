import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  increment,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Reports that a stop is not in use
export const reportStop = async (stop_id) => {
  const ref = doc(db, "stop_reports", stop_id);
  try {
    await setDoc(
      ref,
      { count: increment(1), updated: serverTimestamp() },
      { merge: true }
    );
    alert("✅ Stop reported as not in use.");
  } catch (error) {
    console.error("❌ Error reporting stop:", error);
    alert("Failed to report stop.");
  }
};

// Decrements the not-in-use count
export const reportStopInUse = async (stop_id) => {
  const ref = doc(db, "stop_reports", stop_id);
  try {
    await setDoc(
      ref,
      { count: increment(-1), updated: serverTimestamp() },
      { merge: true }
    );
    alert("👍 Reported stop as in use.");
  } catch (error) {
    console.error("❌ Error reporting stop in use:", error);
    alert("Failed to report.");
  }
};

// Returns true if the stop has ≥ 3 reports
export const isStopPossiblyClosed = async (stop_id) => {
  const ref = doc(db, "stop_reports", stop_id);
  try {
    const snapshot = await getDoc(ref);
    return snapshot.exists() && (snapshot.data().count || 0) >= 3;
  } catch (err) {
    console.error("❌ Error checking stop status:", err);
    return false;
  }
};

// 🚨 NEW: Reports a bus (route+stop combo) as crowded
export const reportBusCrowded = async (route_id, stop_id) => {
  const reportId = `${route_id}_${stop_id}`;
  const ref = doc(db, "crowded_buses", reportId);
  try {
    await setDoc(
      ref,
      { count: increment(1), updated: serverTimestamp() },
      { merge: true }
    );
    alert("😬 Reported bus as crowded!");
  } catch (err) {
    console.error("❌ Error reporting crowded bus:", err);
    alert("Failed to report crowding.");
  }
};

export const getCrowdedReportCount = async (route_id, stop_id) => {
  try {
    const q = query(
      collection(db, "bus_crowded_reports"),
      where("route_id", "==", route_id),
      where("stop_id", "==", stop_id)
    );
    const snapshot = await getDocs(q);
    return snapshot.size; // number of crowded reports
  } catch (error) {
    console.error("❌ Error getting crowded report count:", error);
    return 0;
  }
};
