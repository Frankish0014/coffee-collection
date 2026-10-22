"use client";

import { useEffect } from "react";
import { LayoutGroup, MotionConfig } from "framer-motion";
import CartDrawer from "@/components/CartDrawer";
import DetailDrawer from "@/components/DetailDrawer";
import Header from "@/components/Header";
import InfoOverlay from "@/components/InfoOverlay";
import Marquee from "@/components/Marquee";
import ProductFocus from "@/components/ProductFocus";
import RackView from "@/components/RackView";
import { useShopStore } from "@/store/useShopStore";

export default function Shop() {
  useEffect(() => {
    useShopStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useShopStore.getState();
      if (e.key === "Escape") {
        if (s.dismissTop()) e.preventDefault();
        return;
      }
      const overlayOpen = s.drawerOpen || s.cartOpen || s.info !== null;
      if (!s.focusedId || overlayOpen) return;
      if (e.key === "ArrowRight") s.next();
      else if (e.key === "ArrowLeft") s.prev();
      else if (e.key.toLowerCase() === "f") s.setSide("front");
      else if (e.key.toLowerCase() === "b") s.setSide("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative h-dvh w-full overflow-hidden">
        <LayoutGroup>
          <RackView />
          <ProductFocus />
        </LayoutGroup>
        <InfoOverlay />
        <Header />
        <DetailDrawer />
        <CartDrawer />
        <Marquee />
      </main>
    </MotionConfig>
  );
}
