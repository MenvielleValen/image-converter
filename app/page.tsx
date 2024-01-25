import Image from "next/image";
import styles from "./page.module.css";
import ImageConverter from "@/components/ImageConverter";

export default function Home() {
  return (
    <main className={styles.main}>
      <ImageConverter/>
    </main>
  );
}
