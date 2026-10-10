
import { Link, useParams } from "wouter";
import { SEO } from "@/components/SEO";

const SITE_URL = "https://enrg.co.in";

const articles = {
  "solar-system-for-home": {
    title: "Solar System for Home in India: A Complete Guide",
    description:
      "Learn how home solar systems work in India, compare system types, understand installation requirements, and plan your rooftop solar project.",
    intro:
      "A home solar system can help you generate electricity from sunlight and reduce your dependence on grid electricity. The right system depends on your electricity consumption, available rooftop space, budget, and local installation requirements.",
    sections: [
      {
        heading: "Types of home solar systems",
        paragraphs: [
          "An on-grid system works with the electricity grid and is commonly considered by homes that want to generate solar power while remaining connected to their utility.",
          "An off-grid system uses batteries to store electricity and can suit locations without reliable grid access. A hybrid system combines grid connectivity with battery storage, depending on the equipment installed."
        ]
      },
      {
        heading: "How do you choose the right capacity?",
        paragraphs: [
          "Start by reviewing your electricity bills and monthly unit consumption. A solar installer can estimate an appropriate system size using your energy usage, rooftop conditions, sunlight exposure, and applicable local rules."
        ]
      },
      {
        heading: "What should you check before installation?",
        paragraphs: [
          "Check the condition and usable area of your roof, shading from nearby buildings or trees, equipment warranties, installer credentials, installation costs, and eligibility for any current government subsidy."
        ]
      }
    ]
  },

  "on-grid-vs-off-grid-vs-hybrid-solar": {
    title: "On-Grid vs Off-Grid vs Hybrid Solar: Key Differences",
    description:
      "Compare on-grid, off-grid and hybrid solar systems in India, including batteries, grid connectivity, costs and suitable applications.",
    intro:
      "Choosing between on-grid, off-grid and hybrid solar depends on your electricity supply, backup requirements, budget and local grid arrangements.",
    sections: [
      {
        heading: "On-grid solar systems",
        paragraphs: [
          "An on-grid system is connected to the utility grid. It can reduce grid electricity consumption, but a standard grid-tied inverter generally shuts down during a power outage for safety unless a suitable backup arrangement is installed."
        ]
      },
      {
        heading: "Off-grid solar systems",
        paragraphs: [
          "An off-grid system operates independently of the utility grid and generally requires batteries and appropriate system sizing to supply electricity when sunlight is unavailable."
        ]
      },
      {
        heading: "Hybrid solar systems",
        paragraphs: [
          "A hybrid system combines grid connectivity with battery storage and compatible backup equipment. Its ability to supply power during an outage depends on the inverter, battery and electrical configuration."
        ]
      }
    ]
  },

  "solar-panel-price-india": {
    title: "Solar Panel and Rooftop Solar System Price in India",
    description:
      "Understand the factors that affect rooftop solar system prices in India, including capacity, panels, inverters, installation and subsidies.",
    intro:
      "The price of a rooftop solar installation depends on more than the panels. System capacity, inverter selection, mounting structure, wiring, roof conditions and installation services all affect the final quotation.",
    sections: [
      {
        heading: "What determines the price?",
        paragraphs: [
          "Important factors include system capacity, panel technology, inverter type, mounting requirements, electrical protection, installation complexity and whether batteries are included."
        ]
      },
      {
        heading: "Compare complete quotations",
        paragraphs: [
          "Ask installers to itemise equipment, installation, warranties, applicable taxes, maintenance and any additional work. Compare quotations for the same system capacity and specifications."
        ]
      },
      {
        heading: "Check subsidy eligibility",
        paragraphs: [
          "Government schemes and eligibility conditions can change. Verify current residential rooftop solar subsidy information through official government channels before including a subsidy in your budget."
        ]
      }
    ]
  },

  "how-many-solar-panels-do-i-need": {
    title: "How Many Solar Panels Do I Need for My Home?",
    description:
      "Estimate how many solar panels your home may need using electricity consumption, panel wattage, sunlight, system capacity and roof space.",
    intro:
      "The number of solar panels your home needs depends on your electricity consumption, the wattage of each panel, local solar conditions and the usable area of your roof.",
    sections: [
      {
        heading: "Start with your electricity usage",
        paragraphs: [
          "Review recent electricity bills to understand your monthly consumption in kilowatt-hours, commonly called units. This gives you a starting point for estimating system capacity."
        ]
      },
      {
        heading: "Calculate an initial panel count",
        paragraphs: [
          "A rough panel-count estimate is the required system capacity in watts divided by the wattage of one panel. For example, a 3,000-watt system using 500-watt panels would need approximately six panels, before considering detailed design constraints."
        ]
      },
      {
        heading: "Consider your roof and sunlight",
        paragraphs: [
          "Shading, roof orientation, usable area, weather, system losses and seasonal changes affect energy generation. Have a qualified installer validate the final system design."
        ]
      }
    ]
  },

  "how-to-choose-solar-installer": {
    title: "How to Choose a Reliable Solar Installer in India",
    description:
      "Learn how to compare solar installers in India by checking credentials, quotations, warranties, installation quality and after-sales support.",
    intro:
      "Choosing a suitable solar installer is an important part of a rooftop solar project. Compare the quality of the proposed system, installation service and ongoing support rather than relying on price alone.",
    sections: [
      {
        heading: "Check experience and credentials",
        paragraphs: [
          "Ask about relevant installation experience, required registrations or scheme-specific eligibility, previous projects and customer references. Verify claims independently where possible."
        ]
      },
      {
        heading: "Compare quotations carefully",
        paragraphs: [
          "Check the panel and inverter models, system capacity, mounting structure, wiring, protection equipment, installation scope, taxes and exclusions. Make sure each quotation covers comparable specifications."
        ]
      },
      {
        heading: "Review warranties and support",
        paragraphs: [
          "Confirm product and workmanship warranties, who handles service requests, expected response times, maintenance requirements and the process for resolving installation issues."
        ]
      }
    ]
  },

  "rooftop-solar-maintenance-guide": {
    title: "Rooftop Solar Maintenance Guide for Indian Homes",
    description:
      "Learn how to maintain rooftop solar panels, monitor system performance, spot common issues and arrange safe professional inspections.",
    intro:
      "Routine checks help homeowners monitor rooftop solar performance and identify issues early. Maintenance requirements vary according to the equipment, location and environmental conditions.",
    sections: [
      {
        heading: "Keep panels clean when necessary",
        paragraphs: [
          "Dust, pollen and bird droppings can reduce output. Follow the panel manufacturer's cleaning instructions and use a safe cleaning method. Never climb onto a roof or handle electrical equipment without suitable training and protection."
        ]
      },
      {
        heading: "Monitor system performance",
        paragraphs: [
          "Check the inverter display or monitoring app for generation trends and error messages. Compare performance across similar weather conditions rather than relying on a single day's output."
        ]
      },
      {
        heading: "Arrange professional inspections",
        paragraphs: [
          "Ask a qualified technician to investigate persistent generation drops, damaged cables, unusual inverter warnings or suspected electrical faults. Do not open electrical enclosures or attempt unsafe repairs yourself."
        ]
      }
    ]
  }
} as const;

export default function Articles() {
  const { slug = "" } = useParams<{ slug: string }>();
  const article = articles[slug as keyof typeof articles];

  if (!article) {
    return (
      <>
        <SEO
          title="Article Not Found | ENRG"
          description="The requested ENRG solar guide could not be found."
          path={`/articles/${slug}`}
          noindex={true}
        />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold">Article not found</h1>
          <p className="mt-4">
            This solar guide may have moved or the URL may be incorrect.
          </p>
          <Link href="/">Return to ENRG</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.description}
        path={`/articles/${slug}`}
        noindex={false}
      />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/">Home</Link>
          {" / "}
          <span>Solar Guides</span>
        </nav>

        <article>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {article.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            {article.intro}
          </p>

          {article.sections.map((section) => (
            <section key={section.heading} className="mt-9">
              <h2 className="text-2xl font-semibold">
                {section.heading}
              </h2>

              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 leading-7 text-gray-700"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>

        <section className="mt-12 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Explore solar options with ENRG
          </h2>
          <p className="mt-2 text-gray-700">
            Explore solar equipment and find solar companies through ENRG.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/marketplace" className="underline">
              Explore marketplace
            </Link>
            <Link href="/companies" className="underline">
              Find solar companies
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}