import { notFound } from "next/navigation";
import { Metadata } from "next";
import AdminPanelContent from "./AdminPanelContent";

// Force server-side dynamic rendering per request
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel — Khan Store Premium",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

interface PageProps {
  params: Promise<{ adminPath: string }>;
}

export default async function AdminDynamicPage({ params }: PageProps) {
  const { adminPath } = await params;
  
  // Strictly Server-Side Node.js Environment Variable (Never bundled into client JS)
  const configuredSecretPath = (process.env.ADMIN_PANEL_PATH || "khan-sec-manage-x7k9").replace(/^\//, "").trim();

  if (!adminPath || adminPath.trim() !== configuredSecretPath) {
    notFound();
  }

  return <AdminPanelContent />;
}
