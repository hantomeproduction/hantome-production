import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 👉 [추가 1] 창고 관리인 불러오기

const firebaseConfig = {
  apiKey: "AIzaSyCtU8yR_aiKqXNpSsAIGakG-WaE_z035Xg",
  authDomain: "hantome-production.firebaseapp.com",
  projectId: "hantome-production",
  storageBucket: "hantome-production.firebasestorage.app",
  messagingSenderId: "58148711789",
  appId: "1:58148711789:web:575fe4bcac18f9d3647e64",
  measurementId: "G-NYB8PP918M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // 👉 [추가 2] 창고 문 열고 다른 파일에서 쓸 수 있게 내보내기