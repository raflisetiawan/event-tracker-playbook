import { createContext, useContext } from "react";

export type AttrValue = string | number | boolean;
export type Track = (event: string, attributes?: Record<string, AttrValue>) => void;

export const TrackerContext = createContext<Track>(() => {});

/** Kirim event simulasi dari wireframe ke log. */
export const useTrack = () => useContext(TrackerContext);
