import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Layout } from "@/components/Layout";
import clsx from "clsx";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Pour qui est fait OneLink ?",
    answer:
      "OneLink est parfait pour les créateurs de contenu, freelancers, petites entreprises et professionnels qui veulent centraliser tous leurs liens en un seul endroit. Que vous partagiez votre portfolio, vos réseaux sociaux, ou que vous collectiez des fichiers de clients, OneLink simplifie votre présence en ligne.",
  },
  {
    question: "Comment fonctionne la collecte de fichiers (Drops) ?",
    answer:
      "Créez un 'Drop' public ou privé, partagez le lien, et vos clients/collaborateurs peuvent y téléverser des fichiers directement. Vous recevez des notifications en temps réel et pouvez télécharger tous les fichiers depuis votre tableau de bord. Parfait pour collecter des briefs, portfolios, ou documents.",
  },
  {
    question: "Le plan gratuit est-il vraiment gratuit ?",
    answer:
      "Oui, absolument ! Le plan gratuit inclut 5 liens et 3 drops, avec analytics de base. Aucune carte bancaire requise. Vous pouvez commencer immédiatement et passer au plan Pro quand vous avez besoin de plus de fonctionnalités.",
  },
  {
    question: "Puis-je utiliser mon propre domaine ?",
    answer:
      "Oui, avec le plan Pro, vous pouvez connecter votre propre domaine personnalisé (ex: links.votrenom.com). Cela donne une image plus professionnelle et renforce votre marque.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. OneLink est conforme RGPD, hébergé en Europe, et utilise un chiffrement de bout en bout. Vos données ne sont jamais vendues à des tiers. Vous avez un contrôle total et pouvez exporter ou supprimer vos données à tout moment.",
  },
  {
    question: "Combien de temps mes fichiers sont-ils conservés ?",
    answer:
      "Sur le plan gratuit, les fichiers sont conservés 7 jours. Sur le plan Pro, vous avez 90 jours de rétention. Cela vous donne amplement le temps de télécharger et sauvegarder vos fichiers importants.",
  },
  {
    question: "Puis-je personnaliser l'apparence de mon profil ?",
    answer:
      "Oui ! Personnalisez votre profil avec des thèmes dark/light, ajoutez votre photo de profil, et organisez vos liens comme vous le souhaitez. Le plan Pro offre encore plus d'options de personnalisation.",
  },
  {
    question: "Comment puis-je suivre les performances de mes liens ?",
    answer:
      "OneLink inclut des analytics en temps réel. Voyez combien de clics chaque lien reçoit, d'où viennent vos visiteurs, et quels fichiers sont les plus téléchargés. Le plan Pro offre des analytics avancés avec historique sur 30 et 90 jours.",
  },
];

export function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section
      id="faq"
      className="py-16 md:py-24 bg-background opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Questions fréquentes
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Tout ce que vous devez savoir sur OneLink
            </p>
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => {
              const isExpanded = expandedItems.has(index);
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground pr-6">
                      {item.question}
                    </h3>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  </button>
                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="border-t border-gray-200 dark:border-gray-800">
                      <p className="px-6 md:px-8 py-4 md:py-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </section>
  );
}
