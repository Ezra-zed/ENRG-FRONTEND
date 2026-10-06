import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
} from "lucide-react";
import { SEO } from "@/components/SEO";

const SITE_URL = "https://enrg.co.in";

type Article = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  published: string;
  modified: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

const articles: Article[] = [
  {
    slug: "solar-system-for-home",
    title: "Solar System for Home in India: Complete Guide",
    metaTitle: "Solar System for Home in India: Complete Guide | ENRG",
    description:
      "Learn how home solar systems work in India, how to choose system size, what equipment you need, and how to compare solar installation options.",
    published: "2026-10-06",
    modified: "2026-10-06",
    intro:
      "A home solar system can reduce dependence on grid electricity and help households generate clean energy from their rooftops. The right system depends on your electricity consumption, available roof space, budget, and whether you want an on-grid, hybrid, or off-grid setup.",
    sections: [
      {
        heading: "What is a home solar system?",
        paragraphs: [
          "A residential solar system uses solar panels to convert sunlight into electricity. The generated electricity can be used by appliances in the home, exported to the grid in eligible on-grid systems, or stored in batteries when a battery-based system is installed.",
          "A typical system may include solar panels, an inverter, mounting structures, DC and AC cables, protection equipment, and installation hardware.",
        ],
      },
      {
        heading: "How large a solar system does a home need?",
        paragraphs: [
          "The correct system size should be based primarily on electricity consumption rather than choosing a system only by roof size. Review several months of electricity bills and identify your average monthly and daily consumption.",
        ],
        bullets: [
          "1 kW: suitable for relatively low electricity consumption and smaller homes.",
          "2–3 kW: commonly considered for households with moderate electricity usage.",
          "5 kW: suitable for higher household consumption when sufficient roof space is available.",
          "10 kW or more: generally considered for large homes or properties with substantially higher electricity demand.",
        ],
      },
      {
        heading: "What equipment is required?",
        bullets: [
          "Solar PV panels",
          "Solar inverter",
          "Mounting structure",
          "DC and AC cables",
          "Protection and isolation equipment",
          "Earthing and related safety components",
          "Optional battery storage for hybrid or off-grid systems",
        ],
      },
      {
        heading: "On-grid, hybrid or off-grid?",
        paragraphs: [
          "An on-grid system works with the utility grid and is generally the simplest option when reliable grid connectivity is available. A hybrid system combines grid-connected solar with battery storage. An off-grid system is designed to operate independently of the utility grid and therefore requires sufficient battery storage and system capacity.",
          "Your choice should be based on electricity reliability, backup requirements, budget, and the way your household consumes electricity.",
        ],
      },
      {
        heading: "How to choose a home solar installer",
        paragraphs: [
          "Compare installers based on more than the headline quotation. Check the equipment specifications, warranties, installation scope, protection equipment, expected generation, after-sales support, and the terms of the quotation.",
          "You can explore solar companies and installers through the ENRG Companies directory before requesting or comparing quotations.",
        ],
      },
      {
        heading: "What should you check before buying?",
        bullets: [
          "Total installed system capacity",
          "Solar panel specifications and warranty",
          "Inverter model and warranty",
          "Mounting structure quality",
          "Protection and safety equipment",
          "Installation and commissioning scope",
          "After-sales service",
          "Expected energy generation",
          "Whether battery storage is included",
          "Whether applicable approvals or documentation are included",
        ],
      },
      {
        heading: "Final takeaway",
        paragraphs: [
          "A good residential solar system is not simply the system with the largest capacity or the lowest quotation. The best choice is one that matches your electricity consumption, roof conditions, backup needs, budget, and long-term maintenance requirements.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I know what size solar system my home needs?",
        answer:
          "Start with your electricity bills and calculate average monthly and daily consumption. Then consider roof space, daytime electricity usage, and whether you need battery backup.",
      },
      {
        question: "Is an on-grid solar system suitable for a home?",
        answer:
          "An on-grid system can be suitable when the property has a reliable grid connection and the household wants to generate solar electricity without relying on a large battery system.",
      },
      {
        question: "Do home solar systems require batteries?",
        answer:
          "Not necessarily. On-grid systems can operate without batteries. Batteries become important when backup power or off-grid operation is a requirement.",
      },
    ],
  },

  {
    slug: "on-grid-vs-off-grid-vs-hybrid-solar",
    title: "On-Grid vs Off-Grid vs Hybrid Solar: Which Is Right for You?",
    metaTitle:
      "On-Grid vs Off-Grid vs Hybrid Solar: Which Is Better? | ENRG",
    description:
      "Compare on-grid, off-grid and hybrid solar systems, including batteries, grid dependence, backup power, cost considerations and ideal use cases.",
    published: "2026-10-06",
    modified: "2026-10-06",
    intro:
      "On-grid, off-grid, and hybrid solar systems are designed for different electricity needs. Understanding how each system works makes it easier to select a setup that fits your home or business.",
    sections: [
      {
        heading: "On-grid solar systems",
        paragraphs: [
          "An on-grid solar system is connected to the utility electricity grid. Solar power can be consumed on-site, while electricity can flow to or from the grid depending on generation and consumption.",
          "This type of system is often attractive when the grid is available and battery backup is not the main requirement.",
        ],
        bullets: [
          "Works with the utility grid",
          "Usually does not require a large battery bank",
          "Useful for reducing grid electricity consumption",
          "Suitable where grid availability is generally reliable",
        ],
      },
      {
        heading: "Off-grid solar systems",
        paragraphs: [
          "An off-grid solar system is designed to operate without depending on the utility grid. Because solar generation varies throughout the day, batteries are normally an important part of the system.",
          "System sizing should account for daily consumption, peak loads, battery capacity, solar availability, and periods of low generation.",
        ],
        bullets: [
          "Designed for independent operation",
          "Requires appropriate battery storage",
          "Useful where grid access is unavailable or unreliable",
          "Needs careful system sizing",
        ],
      },
      {
        heading: "Hybrid solar systems",
        paragraphs: [
          "A hybrid system combines solar generation, grid connectivity, and battery storage. Depending on the system design, batteries can provide backup power during grid outages while solar can recharge the battery.",
          "Hybrid systems can be useful for households and businesses that want both solar savings and backup capability.",
        ],
      },
      {
        heading: "Quick comparison",
        bullets: [
          "On-grid: best when grid connectivity is reliable and backup is not the main goal.",
          "Off-grid: best when independent operation is required.",
          "Hybrid: best when solar generation and battery backup are both important.",
        ],
      },
      {
        heading: "Which system should you choose?",
        paragraphs: [
          "Consider your electricity bills, outage frequency, daytime consumption, critical appliances, available roof space, budget, and long-term maintenance expectations.",
          "If you are unsure, compare equipment and speak with qualified solar companies before finalizing the system.",
        ],
      },
    ],
    faqs: [
      {
        question: "Which is cheaper, on-grid or hybrid solar?",
        answer:
          "An on-grid system is generally simpler because it does not require the same amount of battery storage. Hybrid systems can cost more because batteries and related equipment add to the system cost.",
      },
      {
        question: "Does an off-grid solar system need batteries?",
        answer:
          "Yes, batteries are normally essential for off-grid systems because solar panels do not generate electricity at night and generation varies with weather.",
      },
      {
        question: "Is hybrid solar good for areas with power cuts?",
        answer:
          "A properly designed hybrid system can provide backup power during grid interruptions, subject to its battery capacity and inverter configuration.",
      },
    ],
  },

  {
    slug: "solar-panel-price-india",
    title: "Solar Panel Price in India: What Affects the Cost?",
    metaTitle: "Solar Panel Price in India: Complete Cost Guide | ENRG",
    description:
      "Understand solar panel and solar system pricing in India, including capacity, inverter, structure, installation, batteries and other cost factors.",
    published: "2026-10-06",
    modified: "2026-10-06",
    intro:
      "Solar prices in India vary significantly because a complete solar installation includes more than panels. Capacity, equipment quality, inverter type, mounting structure, installation conditions, batteries and other components can all affect the final quotation.",
    sections: [
      {
        heading: "Solar panel price vs complete system price",
        paragraphs: [
          "When comparing quotations, first determine whether the quoted price is for solar panels alone or for a complete installed system. A complete solar installation normally includes several components beyond the panels.",
        ],
      },
      {
        heading: "What affects solar system cost?",
        bullets: [
          "System capacity in kW",
          "Solar panel technology and specifications",
          "Inverter type and capacity",
          "Mounting structure",
          "Cabling and protection equipment",
          "Installation complexity",
          "Roof type and accessibility",
          "Battery storage requirements",
          "Warranty and after-sales support",
          "Applicable approvals, documentation or services",
        ],
      },
      {
        heading: "Why two solar quotations can be different",
        paragraphs: [
          "Two installers may quote different prices for systems with the same nominal capacity because their equipment, warranties, installation scope, structure, protection devices and service commitments may differ.",
          "Do not compare quotations based only on the total price. Compare the equipment list and scope line by line.",
        ],
      },
      {
        heading: "How to compare a solar quotation",
        bullets: [
          "Confirm the exact system capacity.",
          "Check the solar panel model and specifications.",
          "Check the inverter brand and model.",
          "Confirm whether structure and installation are included.",
          "Check protection equipment and cabling.",
          "Review product and installation warranties.",
          "Ask about expected energy generation.",
          "Confirm after-sales support.",
        ],
      },
      {
        heading: "Explore solar equipment and companies",
        paragraphs: [
          "If you are researching a solar installation, use the ENRG Marketplace to explore solar equipment and the ENRG Companies directory to compare solar businesses and installers.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why does solar system pricing vary so much?",
        answer:
          "Pricing depends on system capacity, equipment specifications, inverter type, mounting structure, installation complexity, batteries, warranties and other components included in the quotation.",
      },
      {
        question: "Should I choose the cheapest solar quotation?",
        answer:
          "Not automatically. Compare the equipment, warranties, installation scope, safety components and after-sales service before choosing a quotation.",
      },
      {
        question: "Does a solar system price include installation?",
        answer:
          "It depends on the quotation. Always confirm whether installation, structure, cabling, protection equipment and commissioning are included.",
      },
    ],
  },

  {
    slug: "how-many-solar-panels-do-i-need",
    title: "How Many Solar Panels Do I Need for My Home?",
    metaTitle:
      "How Many Solar Panels Do I Need? Solar Panel Calculator Guide | ENRG",
    description:
      "Learn how to estimate the number of solar panels needed for a home based on electricity consumption, panel wattage, roof space and solar generation.",
    published: "2026-10-06",
    modified: "2026-10-06",
    intro:
      "The number of solar panels you need depends on your electricity consumption, the wattage of each panel, local solar conditions, available roof space, system losses and your target system capacity.",
    sections: [
      {
        heading: "Start with your electricity consumption",
        paragraphs: [
          "Look at several recent electricity bills and calculate your average monthly consumption. This gives you a better starting point than choosing a panel count based only on the size of your home.",
        ],
      },
      {
        heading: "A simple panel-count calculation",
        paragraphs: [
          "A basic calculation is: number of panels = required solar capacity ÷ panel wattage. For example, a 3 kW system using 550 W panels would require approximately 5.45 panels, so the practical design would need to use a suitable whole-panel configuration while accounting for inverter and system design constraints.",
          "The actual system should be designed by considering available panel models, inverter sizing, roof layout, shading and electrical requirements.",
        ],
      },
      {
        heading: "Why panel count is not the whole story",
        bullets: [
          "Panel wattage varies by model.",
          "Roof orientation and tilt affect generation.",
          "Shading can reduce output.",
          "Temperature and weather affect generation.",
          "System losses need to be considered.",
          "Inverter and electrical design affect the final system.",
          "Available roof area can limit the number of panels.",
        ],
      },
      {
        heading: "How much roof space is required?",
        paragraphs: [
          "The required roof area depends on the dimensions of the selected panels and the installation layout. Leave suitable access and maintenance space rather than filling every available part of the roof.",
        ],
      },
      {
        heading: "How to get a more accurate estimate",
        paragraphs: [
          "For a practical estimate, combine your electricity consumption with the proposed panel wattage, roof conditions and expected local solar generation. An installer can then design the final array and inverter configuration.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I calculate the number of solar panels from my electricity bill?",
        answer:
          "You can make an initial estimate from your electricity consumption, but final panel count also depends on panel wattage, solar conditions, roof space, shading and system design.",
      },
      {
        question: "Can I install different wattage solar panels together?",
        answer:
          "It depends on the electrical design and equipment. Mixing panel models or wattages can affect string design and performance, so it should be planned by a qualified installer.",
      },
      {
        question: "Does a bigger solar system always produce more useful electricity?",
        answer:
          "A larger system can generate more electricity, but it should be sized according to consumption, roof conditions, system economics and applicable electrical or grid requirements.",
      },
    ],
  },

  {
    slug: "how-to-choose-solar-installer",
    title: "How to Choose a Solar Installer in India",
    metaTitle:
      "How to Choose a Solar Installer in India: Complete Guide | ENRG",
    description:
      "Learn what to check before choosing a solar installer, including equipment, warranties, quotation details, installation quality and after-sales support.",
    published: "2026-10-06",
    modified: "2026-10-06",
    intro:
      "Choosing the right solar installer is an important part of a successful solar project. The lowest quotation is not always the best choice. A good comparison should consider equipment, installation quality, warranties, safety, documentation and after-sales support.",
    sections: [
      {
        heading: "Check the installer's experience",
        paragraphs: [
          "Look for an installer that can clearly explain system design, equipment selection, installation requirements and maintenance. Ask for details about similar projects where appropriate.",
        ],
      },
      {
        heading: "Compare the complete quotation",
        bullets: [
          "System capacity",
          "Panel brand and model",
          "Inverter brand and model",
          "Mounting structure",
          "Cables and protection equipment",
          "Installation and commissioning",
          "Warranty terms",
          "Maintenance and after-sales support",
          "Expected generation",
          "Any additional services or charges",
        ],
      },
      {
        heading: "Do not ignore safety equipment",
        paragraphs: [
          "A solar installation should include appropriate electrical protection, isolation, earthing and other safety measures according to the system design and applicable requirements.",
        ],
      },
      {
        heading: "Ask about warranties",
        paragraphs: [
          "There can be different warranties for panels, inverters, mounting components and workmanship. Make sure you understand what each warranty covers and how a claim is handled.",
        ],
      },
      {
        heading: "Compare installers through ENRG",
        paragraphs: [
          "The ENRG Companies directory is designed to help users discover solar companies and installers. Compare businesses and then request the information you need before making a purchasing decision.",
        ],
      },
      {
        heading: "Final checklist",
        bullets: [
          "Verify the company details.",
          "Compare multiple quotations.",
          "Check equipment specifications.",
          "Review warranties.",
          "Confirm installation scope.",
          "Ask about maintenance and support.",
          "Understand expected generation.",
          "Keep the final quotation and documentation.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should I ask a solar installer before buying?",
        answer:
          "Ask about system capacity, equipment models, installation scope, warranties, expected generation, protection equipment, maintenance and after-sales support.",
      },
      {
        question: "Should I compare multiple solar installers?",
        answer:
          "Yes. Comparing multiple installers can help you understand equipment differences, pricing, warranties and service scope before making a decision.",
      },
      {
        question: "Is a low solar quotation always better?",
        answer:
          "No. A low quotation may have different equipment or a narrower installation scope. Compare the complete specifications and services rather than price alone.",
      },
    ],
  },

  {
    slug: "rooftop-solar-maintenance-guide",
    title: "Rooftop Solar Maintenance Guide for Homeowners",
    metaTitle:
      "Rooftop Solar Maintenance Guide: Cleaning, Inspection & Care | ENRG",
    description:
      "Learn how to maintain rooftop solar panels, including cleaning, visual inspection, monitoring, electrical safety and common maintenance checks.",
    published: "2026-10-06",
    modified: "2026-10-06",
    intro:
      "Solar panels generally require less routine maintenance than many conventional power systems, but regular inspection and monitoring can help identify dirt, shading, damage, loose connections or equipment issues before they become larger problems.",
    sections: [
      {
        heading: "Keep solar panels reasonably clean",
        paragraphs: [
          "Dust, leaves, bird droppings and other debris can reduce the amount of sunlight reaching the panel surface. Cleaning frequency depends on local dust, weather, pollution and the physical surroundings of the installation.",
          "Do not use unsafe cleaning methods or climb onto a roof without suitable precautions.",
        ],
      },
      {
        heading: "Monitor system performance",
        paragraphs: [
          "Many modern inverters provide generation information through a display or monitoring platform. Watch for unusual drops in production and investigate persistent changes rather than assuming they are caused by weather.",
        ],
      },
      {
        heading: "Inspect for visible problems",
        bullets: [
          "Cracked or visibly damaged panels",
          "Loose or damaged cables",
          "Water ingress around relevant equipment",
          "Corrosion",
          "Debris or new shading",
          "Unusual inverter alerts",
          "Physical damage to mounting components",
        ],
      },
      {
        heading: "Keep new shading under control",
        paragraphs: [
          "Trees and nearby structures can change over time. New shading may reduce solar generation, so periodically check whether vegetation or construction is blocking sunlight.",
        ],
      },
      {
        heading: "Do not perform electrical work yourself",
        paragraphs: [
          "Solar PV systems can contain live electrical circuits even when you are not actively using appliances. Electrical troubleshooting, inverter work, cable repairs and other technical tasks should be handled by appropriately qualified professionals.",
        ],
      },
      {
        heading: "When should you call an installer?",
        bullets: [
          "The inverter repeatedly reports an error.",
          "Generation drops unexpectedly and stays low.",
          "Panels or mounting components appear damaged.",
          "Cables appear exposed or damaged.",
          "There are signs of water ingress.",
          "The system behaves differently after severe weather.",
        ],
      },
    ],
    faqs: [
      {
        question: "How often should solar panels be cleaned?",
        answer:
          "There is no single schedule for every location. Cleaning frequency depends on dust, pollution, rainfall, bird activity and the surrounding environment.",
      },
      {
        question: "Can I repair solar panels myself?",
        answer:
          "Electrical and technical repairs should be handled by qualified professionals. Do not attempt live electrical work on a rooftop solar system.",
      },
      {
        question: "What is the most important solar maintenance task?",
        answer:
          "Regularly monitoring system performance and arranging appropriate inspection when performance changes can help identify problems early.",
      },
    ],
  },
];

function getArticle(slug?: string) {
  return articles.find((article) => article.slug === slug);
}

function ArticleSchema({ article }: { article: Article }) {
  useEffect(() => {
    const schemaId = "enrg-article-schema";

    const existing = document.getElementById(schemaId);
    if (existing) {
      existing.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      datePublished: article.published,
      dateModified: article.modified,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/articles/${article.slug}`,
      },
      author: {
        "@type": "Organization",
        name: "ENRG",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "ENRG",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.svg`,
        },
      },
      isPartOf: {
        "@type": "WebSite",
        name: "ENRG",
        url: SITE_URL,
      },
    };

    const script = document.createElement("script");
    script.id = schemaId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, [article]);

  return null;
}

function FAQSchema({ article }: { article: Article }) {
  useEffect(() => {
    const schemaId = "enrg-faq-schema";

    const existing = document.getElementById(schemaId);
    if (existing) {
      existing.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.id = schemaId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, [article]);

  return null;
}

function ArticlePage({ article }: { article: Article }) {
  const canonicalPath = `/articles/${article.slug}`;

  return (
    <>
      <SEO
        title={article.metaTitle}
        description={article.description}
        path={canonicalPath}
        noindex={false}
      />

      <ArticleSchema article={article} />
      <FAQSchema article={article} />

      <main className="min-h-screen bg-white">
        <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to ENRG
            </Link>
          </div>

          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-sm text-gray-500"
          >
            <Link href="/" className="hover:text-gray-900">
              ENRG
            </Link>
            <span className="mx-2">/</span>
            <span>Solar Guide</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{article.title}</span>
          </nav>

          <header className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700">
              ENRG Solar Guide
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              {article.intro}
            </p>

            <div className="mt-5 text-sm text-gray-500">
              Published: {article.published}
            </div>
          </header>

          <div className="mb-10 rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <p className="text-sm leading-6 text-gray-700">
                This guide is intended for general solar research. System
                design, electrical work and installation should be handled by
                appropriately qualified professionals.
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-4 text-base leading-8 text-gray-700"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-base leading-7 text-gray-700"
                      >
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="mt-14 border-t border-gray-200 pt-10">
            <div className="mb-6 flex items-center gap-3">
              <CircleHelp className="h-6 w-6 text-green-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {article.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-base leading-7 text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-2xl bg-gray-900 p-7 text-white sm:p-9">
            <h2 className="text-2xl font-bold">
              Continue your solar research with ENRG
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-300">
              Explore solar equipment, discover solar companies and installers,
              or request information for your solar project.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/companies"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Find Solar Companies
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Request a Quote
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <footer className="mt-10 border-t border-gray-200 pt-6">
            <Link
              href="/"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              ← Return to ENRG
            </Link>
          </footer>
        </article>
      </main>
    </>
  );
}

export default function Articles() {
  const params = useParams<{ slug: string }>();
  const [location] = useLocation();

  const article = getArticle(params.slug);

  if (!article) {
    return (
      <>
        <SEO
          title="Solar Guide Not Found | ENRG"
          description="The requested ENRG solar guide could not be found."
          path={location}
          noindex={true}
        />

        <main className="min-h-screen bg-gray-50 px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Article Not Found
            </h1>

            <p className="mt-4 text-gray-600">
              The solar guide you are looking for does not exist.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to ENRG
            </Link>
          </div>
        </main>
      </>
    );
  }

  return <ArticlePage article={article} />;
}