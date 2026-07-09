import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariantClass } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[#0B0F14]">
      <header className="border-b border-white/10 bg-[#0B0F14]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4">
          <Logo href="/" />
          <Link
            href="/"
            className={`${buttonVariantClass("ghost")} py-2! text-sm text-gray-300! hover:text-white!`}
          >
            Home
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
