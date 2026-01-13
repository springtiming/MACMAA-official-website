import Head from "next/head";
import { safeJsonStringify } from "@/lib/seo/utils";
import type { JsonLd as JsonLdData } from "@/lib/seo/types";

type JsonLdProps = {
  data?: JsonLdData | null;
};

export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  const entries = Array.isArray(data) ? data : [data];

  return (
    <Head>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(entry) }}
        />
      ))}
    </Head>
  );
}
