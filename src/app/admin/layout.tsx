import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EGA Admin | Management",
  description: "Secure administrative dashboard for EGA Roleplay",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root">
      {children}
    </div>
  );
}
