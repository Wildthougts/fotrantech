import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

export default function Hero() {
  return (
    <section className="container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center px-4 py-16 md:px-6 md:py-24 lg:py-32">
      <div className="space-y-4 md:space-y-6">
        <h1 className=" text-center bg-gradient-to-br from-foreground from-30% via-foreground/90 to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          Your Music Promotion
          <br className="hidden sm:block" />
          <span className="mt-2 block sm:mt-0">Platform</span>
        </h1>
        <p className=" text-center mx-auto max-w-[42rem] text-sm leading-normal text-muted-foreground sm:text-base md:text-lg lg:text-xl">
          Reach new audiences, boost your streams, and dominate the charts with
          Fotrantech&apos;s powerful music promotion tools. Whether you&apos;re
          an emerging artist or an established name, we help your music get the
          attention it deserves.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-4 md:mt-8">
        <SignUpButton>
          <Button size="lg" className="w-full sm:w-auto">
            Explore Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </SignUpButton>

        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          Learn more
        </Button>
      </div>
    </section>
  );
}
