import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold md:text-xl bg-gradient-to-r from-gray-400 to-black bg-clip-text text-transparent">
              Fotrantech
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <SignInButton>
            <Button className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 bg-white text-black hover:bg-gray-200 transition-colors duration-200">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button>Get Started</Button>
          </SignUpButton>
        </div>
      </div>
    </header>
  );
}
