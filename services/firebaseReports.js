// firebaseReports.js
import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

// You can change this value for demo purposes
const THRESHOLD = 3;

// Handles both reporting as "not in use" or "in use"
export const reportStopStatus = async (stop_id, status) => {
  try {
    const ref = doc(db, "stop_reports", stop_id);

    const data = {
      lastReported: serverTimestamp(),
    };

    if (status === "notInUse") {
      data.notInUseCount = increment(1);
    } else if (status === "inUse") {
      data.notInUseCount = increment(-1);
    }

    await setDoc(ref, data, { merge: true });

    alert(`✅ Stop reported as ${status === "notInUse" ? "not in use" : "in use"}`);
  } catch (err) {
    console.error("❌ Reporting error:", err);
    alert("Failed to report stop.");
  }
};

// Used to check if stop should be flagged in modal
export const checkStopStatus = async (stop_id) => {
  try {
    const ref = doc(db, "stop_reports", stop_id);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const data = snapshot.data();
      if ((data.notInUseCount || 0) >= THRESHOLD) {
        return "possiblyClosed";
      }
    }

    return "active";
  } catch (err) {
    console.error("❌ Error checking stop status:", err);
    return "unknown";
  }
};