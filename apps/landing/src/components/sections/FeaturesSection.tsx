import { Link, Upload, Bell, User, Lock, BarChart3 } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { Layout } from "@/components/Layout";

const features = [
  {
    title: "One Link for Everything",
    description:
      "Un seul lien pour partager tout. Bio link moderne et élégant pour centraliser tous vos contenus.",
    icon: Link,
  },
  {
    title: "File Sharing / Drops",
    description:
      "Partage de fichiers facile avec upload multiple. Contrôlez la visibilité avec des drops publics ou privés.",
    icon: Upload,
  },
  {
    title: "Real-time Notifications",
    description:
      "Notifications en temps réel pour chaque interaction. Emails automatiques et badge de comptage.",
    icon: Bell,
  },
  {
    title: "Customizable Profile",
    description:
      "Profil entièrement personnalisable. Thème dark/light, analytics intégrés et design sur mesure.",
    icon: User,
  },
  {
    title: "Privacy & Security",
    description:
      "Contrôle total sur vos données. Drops privés/publics et authentification à deux facteurs disponible.",
    icon: Lock,
  },
  {
    title: "Analytics",
    description:
      "Statistiques en temps réel. Suivez les clics, vues et téléchargements avec des insights détaillés.",
    icon: BarChart3,
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-background opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Everything you need to share your content, files, and links in one
              beautiful place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </Layout>
    </section>
  );
}
