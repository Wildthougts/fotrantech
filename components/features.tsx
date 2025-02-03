import { Brain, Cloud, Shield, Zap } from "lucide-react";

const features = [
  {
    name: "AI-Powered Marketing",
    description:
      "Harness data-driven campaigns that connect your music with the perfect listeners, driving engagement and growth.",
    icon: Brain,
  },
  {
    name: "Chart Promotion Strategies",
    description:
      "Maximize your chances of topping charts on platforms like Spotify, Apple Music, and more.",
    icon: Cloud,
  },
  {
    name: "Optimized Playlist Placement",
    description:
      "Get your tracks featured on high-traffic playlists. Our strategy focuses on curating and positioning your music where listeners are most active, ensuring maximum streaming exposure.",
    icon: Shield,
  },
  {
    name: "Rapid Stream Surge",
    description:
      "Accelerate your music's growth with our proven strategy to boost streams in a short period. Experience a surge in plays and watch your music quickly climb the charts with tactics designed for immediate impact.",
    icon: Zap,
  },
];

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Cutting-Edge Solutions
        </h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Discover how Fotrantech can amplify your music career with our
          innovative solutions designed to help you grow your audience and
          increase streams.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative overflow-hidden rounded-lg border bg-background p-8"
          >
            <div className="flex items-center gap-4">
              <feature.icon className="h-8 w-8" />
              <h3 className="font-bold">{feature.name}</h3>
            </div>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
