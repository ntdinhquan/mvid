"use client";

import dynamic from "next/dynamic";
import { sampleDemos } from "@/components/sample-demos";

export function DemoWrapper({ id }: { id: string }) {
  const Demo = dynamic(
    sampleDemos[id] || (() => Promise.resolve(() => <div>No demo available yet.</div>)),
    { ssr: false }
  );

  return <Demo />;
}
