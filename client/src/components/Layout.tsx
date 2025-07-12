
import { ReactNode } from "react";
import ModernHeader from "./ModernHeader";
import ModernFooter from "./ModernFooter";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <ModernHeader />
      <main className="pt-16">
        {children}
      </main>
      <ModernFooter />
    </div>
  );
};
