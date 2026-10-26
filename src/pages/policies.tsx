
import { Link } from 'wouter';
import { PageHeader } from '@/components/PageHeader';

const partnerTerms = [
  {
    title: '1. Purpose and Scope',
    paragraphs: [
      'These Company Partner Terms & Conditions (“Terms”) govern the registration and use of the ENRG platform by solar installation companies, solar product sellers, service providers and other eligible business partners (“Partner”, “Company”, “you” or “your”).',
      'ENRG provides digital facilities through which customers may discover solar-related companies and products, submit enquiries, request quotations and contact providers. Depending on the features enabled, ENRG may also allow Partners to publish product listings or service offerings.',
      'By registering as a Partner, accessing Partner features or accepting a customer enquiry through ENRG, you agree to these Terms and the applicable policies referenced below.',
    ],
  },
  {
    title: '2. Eligibility and Company Registration',
    paragraphs: [
      'You must be legally eligible to conduct the business activities offered through ENRG.',
      'You must provide accurate and complete information, including as applicable:',
    ],
    bullets: [
      'Legal business name and business type.',
      'Registered or principal business address.',
      'Name and contact details of an authorised representative.',
      'Business email address and phone number.',
      'GSTIN, PAN, CIN, Udyam registration or other relevant registration details, where applicable.',
      'Relevant licences, certifications, qualifications and supporting documents, where required for your activities.',
    ],
    extra: [
      'You confirm that you are authorised to register the business and accept these Terms on its behalf.',
      'You must promptly update ENRG if any registration details, licences, contact information or business status change.',
      'ENRG may request additional information, conduct reasonable verification, restrict features or decline, suspend or reject a registration where information is incomplete, misleading, unverifiable or raises legitimate compliance concerns.',
      'Registration or verification by ENRG is not a guarantee of the Partner’s quality, solvency, performance or future compliance.',
    ],
  },
  {
    title: '3. Partner Account and Security',
    paragraphs: [
      'You are responsible for keeping your account credentials secure and for activities carried out through your account.',
      'You must promptly notify ENRG of unauthorised account access, suspected fraud or a security incident affecting your account.',
      'You must not impersonate another business, share access in an unauthorised manner, create fraudulent accounts or attempt to bypass ENRG’s security controls.',
    ],
  },
  {
    title: '4. Lead Generation and Customer Enquiries',
    paragraphs: [
      'ENRG may share customer enquiries with Partners based on the customer’s requirements, service location, category, availability or other relevant criteria.',
      'ENRG does not guarantee a minimum number of leads, customer responses, site visits, sales, installations or revenue.',
      'A Partner receiving an enquiry must:',
    ],
    bullets: [
      'Contact the customer professionally and within a reasonable time.',
      'Identify the business accurately.',
      'Explain the proposed scope, pricing, assumptions and exclusions clearly.',
      'Respect the customer’s communication preferences and applicable law.',
      'Keep appropriate records of quotations, customer approvals and work undertaken.',
    ],
    extra: [
      'Customer contact information may be used only for the enquiry, quotation, installation, after-sales service or other purpose for which it was lawfully shared. It must not be sold, rented, disclosed to unauthorised third parties or used for unrelated marketing without an appropriate lawful basis and any required consent.',
      'A Partner must not misuse, scrape, export, resell or retain ENRG-provided customer data beyond what is reasonably necessary and legally permitted.',
      'A Partner must not falsely claim that a customer has accepted a quotation, placed an order or authorised an installation.',
      'ENRG may investigate credible complaints about misuse of leads, spam, misleading communications or other improper conduct and may restrict a Partner’s access where appropriate.',
    ],
  },
  {
    title: '5. Marketplace Listings and Business Information',
    paragraphs: [
      'Partners may publish products, services, prices, specifications, photographs, availability, service areas and other information only where the relevant feature is available and the Partner is authorised to offer them.',
      'The Partner is responsible for ensuring that all listing information is accurate, current, complete and not misleading. This includes, where applicable:',
    ],
    bullets: [
      'Product make, model, capacity and specifications.',
      'Price, applicable taxes, delivery or installation charges.',
      'Stock or availability information.',
      'Warranty and guarantee terms.',
      'Installation requirements and exclusions.',
      'Return, replacement, cancellation and refund conditions.',
      'Seller identity and relevant contact information.',
    ],
    extra: [
      'Partners must have the necessary rights to publish product photographs, logos, descriptions and other content.',
      'ENRG may correct formatting errors, request supporting information, remove unlawful or misleading content, or suspend listings that breach these Terms or applicable law.',
      'Listing a product or service on ENRG does not, by itself, constitute a completed sale, a guarantee of stock or a guarantee that a customer will purchase it.',
    ],
  },
  {
    title: '6. Quotations, Orders and Customer Contracts',
    paragraphs: [
      'The Partner is responsible for preparing accurate quotations and explaining the scope of work, equipment, taxes, charges, timelines, payment milestones, exclusions and cancellation terms before the customer commits.',
      'Unless a separate written agreement states otherwise, the contract for the Partner’s products or services is between the Partner and the customer.',
      'The Partner must obtain the customer’s informed approval before beginning chargeable work or making material changes to an agreed quotation.',
      'The Partner must not use misleading claims about savings, system performance, subsidies, government approvals, product quality or installation timelines.',
      'Any claim about government subsidies or incentives must be accurate, appropriately qualified and consistent with the relevant scheme’s actual conditions. Do not guarantee subsidy approval or disbursement unless legally and factually justified.',
    ],
  },
  {
    title: '7. Direct Payments, Invoices and Refunds',
    paragraphs: [
      'Under the current ENRG model, customers pay the Partner directly through a payment method agreed between them. ENRG does not collect or hold the customer’s purchase or installation payment unless the parties separately agree to a supported payment arrangement in writing.',
      'The Partner is responsible for providing invoices or receipts where required, collecting applicable taxes, complying with tax obligations and maintaining appropriate transaction records.',
      'The Partner is responsible for explaining and honouring its applicable payment, cancellation, refund, replacement, return and warranty terms, subject to applicable law and the customer’s statutory rights.',
      'Payment disputes, overcharging claims, non-delivery complaints and refund requests must be addressed promptly by the Partner. ENRG may assist with communication or complaint handling but will not be treated as the payment recipient merely because the customer found the Partner through ENRG.',
      'Nothing in this clause excludes any responsibility or remedy that applicable law places on ENRG or the Partner.',
    ],
  },
  {
    title: '8. Installation Quality, Safety and Compliance',
    paragraphs: [
      'The Partner is responsible for carrying out its business in accordance with applicable Indian laws, regulations, technical requirements, safety standards and relevant local requirements.',
      'The Partner must ensure that personnel performing installation or electrical work have the qualifications, authorisations, training and supervision required for that work.',
      'The Partner must obtain applicable permissions, approvals, inspections and customer authorisations for its own work, where required.',
      'The Partner must use appropriate products and materials and follow applicable installation, electrical, fire, structural and occupational-safety requirements.',
      'The Partner is responsible for its employees, subcontractors, equipment, workmanship, project timelines, after-sales service and commitments made to customers.',
      'The Partner must promptly inform affected customers of material delays, safety issues, product recalls or other significant problems relating to a project.',
    ],
  },
  {
    title: '9. Warranties and After-Sales Service',
    paragraphs: [
      'The Partner must clearly explain any product warranty, workmanship warranty, performance commitment, maintenance obligation and warranty exclusions before the customer purchases or approves the work.',
      'The Partner must honour warranties and after-sales commitments that it offers or is legally required to provide.',
      'A manufacturer’s warranty must not be represented as a separate warranty from the Partner or ENRG unless that representation is accurate.',
      'ENRG does not create or extend a manufacturer’s or Partner’s warranty merely by listing a product or company. This does not remove any obligation ENRG may independently have under applicable law or its own express commitments.',
    ],
  },
  {
    title: '10. Partner Fees and Commercial Arrangements',
    paragraphs: [
      'Any registration fee, subscription fee, listing charge, lead fee, commission or other commercial charge payable to ENRG must be clearly disclosed and accepted by the Partner before it applies.',
      'If no fee has been agreed or disclosed, the Partner is not deemed to have accepted an undisclosed fee solely by registering.',
      'Any agreed fee, invoice, payment deadline, tax treatment and applicable cancellation or refund conditions may be documented in a separate commercial schedule or written agreement.',
      'ENRG will not represent that a Partner has agreed to a commission or other charge that the Partner has not accepted.',
    ],
  },
  {
    title: '11. Customer Data and Privacy',
    paragraphs: [
      'Each party must handle personal data in accordance with applicable data-protection and privacy laws and the ENRG Privacy Policy.',
      'A Partner must use customer data only for the stated and lawful purpose for which it was provided, keep it secure and limit access to authorised personnel who need it.',
      'A Partner must not disclose customer data to another installer, broker, advertiser or other third party unless lawfully permitted and any required consent or notice has been obtained.',
      'A Partner must maintain reasonable security measures, promptly notify ENRG of a suspected breach involving ENRG-provided customer data and cooperate in appropriate containment and remediation.',
      'When customer data is no longer needed, the Partner must securely delete or anonymise it unless retention is legally required.',
      'Nothing in these Terms replaces any separate privacy notice, consent, data-processing agreement or other measure required by applicable law.',
    ],
  },
  {
    title: '12. Prohibited Conduct',
    bullets: [
      'Providing false company details, documents, certifications, reviews or references.',
      'Publishing fraudulent, unlawful, counterfeit or misleading listings.',
      'Misusing customer information or contacting customers for unrelated purposes without lawful permission.',
      'Making unauthorised claims that ENRG endorses or guarantees the Partner.',
      'Offering or accepting bribes, engaging in fraud or misrepresenting government affiliations.',
      'Infringing intellectual property or misusing another company’s brand.',
      'Manipulating reviews, ratings, search placement or customer enquiries.',
      'Circumventing platform security, interfering with its operation or attempting unauthorised access.',
      'Engaging in harassment, discrimination, threats or unsafe practices.',
      'Violating applicable consumer-protection, competition, tax, data-protection or other laws.',
    ],
  },
  {
    title: '13. Reviews, Complaints and Investigations',
    paragraphs: [
      'Partners must not fabricate, purchase, threaten customers over or improperly manipulate reviews and ratings.',
      'ENRG may review reports of suspected misconduct, request relevant evidence and take proportionate action consistent with its policies and applicable law.',
      'Partners must cooperate reasonably with legitimate investigations and respond to customer complaints in a timely and professional manner.',
      'ENRG may provide a complaint channel or facilitate communication, but this does not remove the Partner’s responsibility to resolve matters for which it is responsible or any duties ENRG has under law.',
    ],
  },
  {
    title: '14. ENRG’s Role and Platform Availability',
    paragraphs: [
      'ENRG provides digital tools for discovery, enquiries and marketplace listings. Unless expressly stated otherwise in writing, ENRG is not the installer, manufacturer, seller of the Partner’s products or employer of the Partner’s personnel.',
      'ENRG does not guarantee that any lead is exclusive, that a customer will respond, or that any transaction will be completed.',
      'Platform features may be updated, suspended or temporarily unavailable for maintenance, security, legal compliance or operational reasons.',
      'ENRG may use reasonable checks and moderation measures, but platform registration or a listing must not be treated as an unconditional guarantee of the Partner’s credentials, products or work.',
      'Nothing in these Terms limits a customer’s statutory rights or excludes liability that cannot lawfully be excluded. Any limitation of liability must be interpreted subject to applicable law.',
    ],
  },
  {
    title: '15. Suspension and Termination',
    paragraphs: [
      'A Partner may request account closure by contacting [insert support email], subject to outstanding legal, customer-service, transaction or record-retention obligations.',
      'ENRG may restrict, suspend or terminate an account or listing where reasonably necessary because of suspected fraud, material breach of these Terms, unlawful activity, misuse of customer data, safety concerns, false information or a legal requirement.',
      'Where appropriate and lawful, ENRG may provide notice and an opportunity to address the issue. Immediate action may be taken where necessary to protect users, data, safety or legal compliance.',
      'Suspension or termination does not extinguish accrued payment obligations, ongoing warranties, customer remedies, confidentiality obligations or other provisions that by their nature should continue.',
    ],
  },
  {
    title: '16. Changes to These Terms',
    paragraphs: [
      'ENRG may update these Terms to reflect changes in the platform, business model or applicable law. Material changes will be communicated through an appropriate notice or other lawful method. Where required, ENRG will obtain fresh acceptance before applying revised terms to continued Partner use.',
      'The current version and effective date will be made available through the ENRG website or Partner dashboard.',
    ],
  },
  {
    title: '17. Governing Law and Disputes',
    paragraphs: [
      'These Terms are governed by the laws of India, subject to applicable mandatory legal rights and jurisdictional rules.',
      'The parties will first attempt to resolve disputes through good-faith written communication. If a dispute cannot be resolved, it may be referred to the competent courts or other lawful dispute-resolution forum with jurisdiction. Nothing in this clause prevents a consumer or other person from exercising a non-waivable statutory remedy.',
    ],
  },
  {
    title: '18. Acceptance',
    paragraphs: [
      'By selecting the acceptance checkbox during Partner registration and completing registration, the authorised representative confirms that:',
    ],
    bullets: [
      'They have read and understood these Terms.',
      'They are authorised to accept these Terms for the business.',
      'The registration information and documents submitted are accurate to the best of their knowledge.',
      'They agree to comply with these Terms and the applicable ENRG policies.',
    ],
    extra: [
      'Electronic acceptance records may be retained to evidence the version accepted, the date and time of acceptance, and the relevant Partner account, subject to applicable law and the ENRG Privacy Policy.',
    ],
  },
];

const privacyPolicySections = [
  {
    title: '1. Information We Collect',
    paragraphs: [
      'We collect information that you provide directly to us, such as your name, business details, contact information, identification documents, service preferences, project requirements and account credentials.',
      'We also collect information automatically when you use ENRG, including device and browser information, IP address, usage patterns, referral sources, page views, search activity, communication metadata and cookies or similar tracking technologies.',
      'Where applicable, we may collect information from third parties such as public directories, partner referrals, payment processors, identity verification services or government or regulatory sources for compliance and fraud prevention.',
    ],
  },
  {
    title: '2. How We Use Information',
    paragraphs: [
      'We use personal and business information to provide, operate, improve and personalise the ENRG platform and services, including matching customers with relevant providers, managing registrations, processing enquiries, facilitating quotations, supporting account access and enabling communication between parties.',
      'We may use information to verify identity, prevent fraud, detect misuse, maintain security, comply with legal obligations, resolve disputes, support customer service and improve the experience of using ENRG.',
      'We may also use aggregated, anonymised or de-identified information for analytics, product development, reporting and platform improvements.',
    ],
  },
  {
    title: '3. Information Sharing',
    paragraphs: [
      'We may share information with service providers who help us operate the platform, support payments, process communications, host data, to perform analytics, handle customer support or manage security and compliance.',
      'We may share relevant customer or business information with partner businesses, installers, vendors or service providers where necessary to respond to a request, complete a transaction, provide a quotation or otherwise fulfil the purpose for which the information was provided.',
      'We may disclose information when required by law, court order, regulatory request, legal process or to protect the rights, safety or property of ENRG, its users or third parties.',
    ],
  },
  {
    title: '4. Data Retention and Security',
    paragraphs: [
      'We retain personal data only for as long as necessary to provide our services, comply with legal and regulatory obligations, resolve disputes, enforce agreements and maintain reasonable business records.',
      'We use commercially reasonable administrative, technical and organisational safeguards to protect data, but no system is completely secure. You should use strong passwords and take reasonable steps to protect your account credentials and devices.',
      'If a data breach involving personal data is suspected or confirmed, we will act reasonably to contain, assess and notify the relevant individuals and authorities where required by applicable law.',
    ],
  },
  {
    title: '5. Cookies and Tracking',
    paragraphs: [
      'ENRG may use cookies, pixels, analytics tools and similar tracking technologies to remember preferences, understand usage patterns, support security, measure marketing effectiveness and improve content and services.',
      'You can manage cookie preferences through your browser settings and privacy controls. However, disabling some cookies may affect platform functionality or the quality of the user experience.',
    ],
  },
  {
    title: '6. Your Rights and Choices',
    paragraphs: [
      'Depending on your jurisdiction, you may have rights to access, correct, update, delete or restrict the processing of your personal data, object to certain processing, request data portability and withdraw consent where consent is the legal basis for processing.',
      'To exercise these rights, contact us through the details in this policy or the contact information provided on the platform. We may ask for reasonable information to verify your identity before processing a request.',
      'Where lawful and appropriate, we may decline requests that are excessive, unfounded, impractical, unlawful or would prejudice the rights or legitimate interests of others.',
    ],
  },
  {
    title: '7. International Transfers',
    paragraphs: [
      'Your information may be processed in India or other jurisdictions where ENRG or its service providers operate, and may be transferred to countries with different data-protection laws.',
      'Where required, we will put in place appropriate safeguards to protect personal data in accordance with applicable law.',
    ],
  },
  {
    title: '8. Children and Sensitive Information',
    paragraphs: [
      'ENRG is intended for business and consumer audiences in connection with lawful solar and energy-related services. We do not knowingly collect personal information from children without appropriate legal basis and parental or guardian consent where required.',
      'You should not submit sensitive personal information such as financial account numbers, passwords, government identifiers or highly sensitive medical information unless necessary and legally permitted.',
    ],
  },
  {
    title: '9. Updates to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time to reflect legal, operational or product changes. Material updates will be communicated through the platform, email or other reasonable notice where required.',
      'The effective date and the latest version of this policy will be made available on the ENRG website and platform.',
    ],
  },
  {
    title: '10. Contact',
    paragraphs: [
      'If you have questions about this Privacy Policy, how we handle your personal data, or how to exercise your rights, please contact ENRG through the support or legal contact details provided on the ENRG platform or website.',
    ],
  },
];

export function TermsAndConditions() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      <PageHeader
        eyebrow="ENRG policies"
        title="Company Partner Terms & Conditions"
        description="Terms governing solar installation companies, product sellers, service providers and other business partners using ENRG."
      />

      <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-6 text-sm leading-7 text-muted-foreground sm:p-9">
        <div className="space-y-2 border-b border-border pb-6">
          <p>
            <strong className="text-foreground">Effective Date:</strong>{' '}
            22/09/2026
          </p>
          <p>
            <strong className="text-foreground">Last Updated:</strong>{' '}
            22/09/2026
          </p>
          <p>
            <strong className="text-foreground">Platform:</strong>{' '}
            <a
              href="https://www.enrg.co.in/"
              className="text-accent underline"
            >
              https://www.enrg.co.in/
            </a>
          </p>
          <p>
            <strong className="text-foreground">Platform Operator:</strong>{' '}
            ENRG
          </p>
          <p>
            <strong className="text-foreground">Registered Address:</strong>{' '}
            Chakataulla, Andharmanik, Bishnupur, South 24 Parganas, West Bengal - 743503, India
          </p>
          <p>
            <strong className="text-foreground">Contact Email:</strong>{' '}
            support@enrg.co.in
          </p>
        </div>

        {partnerTerms.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              {section.title}
            </h2>

            {section.paragraphs?.map((paragraph, index) => (
              <p key={`paragraph-${index}`}>{paragraph}</p>
            ))}

            {section.bullets && (
              <ul className="list-disc space-y-2 pl-6">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}

            {section.extra?.map((paragraph, index) => (
              <p key={`extra-${index}`}>{paragraph}</p>
            ))}
          </section>
        ))}

        <div className="border-t border-border pt-6">
          <Link
            href="/privacy-policy"
            className="font-semibold text-accent underline"
          >
            Read the Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}

export function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      <PageHeader
        eyebrow="ENRG policies"
        title="Privacy Policy"
        description="How ENRG collects, uses, protects and shares personal and business information on the platform."
      />

      <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-6 text-sm leading-7 text-muted-foreground sm:p-9">
        <div className="space-y-2 border-b border-border pb-6">
          <p>
            <strong className="text-foreground">Effective Date:</strong>{' '}
            22/09/2026
          </p>
          <p>
            <strong className="text-foreground">Last Updated:</strong>{' '}
            22/09/2026
          </p>
          <p>
            <strong className="text-foreground">Website:</strong>{' '}
            <a
              href="https://www.enrg.co.in/"
              className="text-accent underline"
            >
              https://www.enrg.co.in/
            </a>
          </p>
          <p>
            <strong className="text-foreground">Contact:</strong>{' '}
            [Insert official support email]
          </p>
        </div>

        {privacyPolicySections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              {section.title}
            </h2>

            {section.paragraphs?.map((paragraph, index) => (
              <p key={`paragraph-${index}`}>{paragraph}</p>
            ))}
          </section>
        ))}

        <div className="border-t border-border pt-6">
          <Link
            href="/terms-and-conditions"
            className="font-semibold text-accent underline"
          >
            Read the Partner Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </main>
  );
}
