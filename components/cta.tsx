import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

export default function CTA() {
  return (
    <section className="border-t">
      <div className="container flex flex-col items-center gap-4 py-24 text-center md:py-32">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Ready to Take Your Music to the Next Level?
        </h2>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Join artists who trust Fotrantech to amplify their music, grow their
          fanbase, and achieve chart-topping success.
        </p>
        <SignUpButton>
          <Button size="lg" className="mt-4">
            Get Started Today
          </Button>
        </SignUpButton>
      </div>
    </section>
  );
}
