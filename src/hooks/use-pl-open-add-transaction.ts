"use client";

import { useEffect } from "react";
import { PL_OPEN_ADD_TX } from "@/lib/ui/pl-events";

export function usePlOpenAddTransaction(onOpen: () => void) {
  useEffect(() => {
    const fn = () => onOpen();
    window.addEventListener(PL_OPEN_ADD_TX, fn);
    return () => window.removeEventListener(PL_OPEN_ADD_TX, fn);
  }, [onOpen]);
}
