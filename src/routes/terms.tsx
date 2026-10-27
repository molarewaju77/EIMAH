import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — EIMAH" },
      {
        name: "description",
        content: "By accessing our website or placing an order, you agree to these Terms & Conditions.",
      },
    ],
  }),
});

function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="The legal terms governing your use of Eimah's website and purchase of products."
      lastUpdated="September 2026"
      currentPath="/terms"
    >
      <div className="space-y-10">
        <section>
          <p className="lead text-base sm:text-lg text-neutral-800 font-normal leading-relaxed">
            By accessing our website or placing an order, you agree to these Terms & Conditions. Please
            read them carefully before using our services.
          </p>
        </section>

        <hr className="border-neutral-200 my-8" />

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            1. About Eimah
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd is an e-commerce company committed to providing carefully curated quality
            products and business solutions. These Terms & Conditions govern your use of our website
            and the purchase of products or services from us.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            2. Acceptance of Terms
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            By using this website, creating an account, or placing an order, you confirm that you have
            read, understood, and agreed to these Terms & Conditions.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
            If you do not agree with any part of these Terms, please do not use our website or
            services.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            3. Products and Pricing
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We strive to ensure that all product descriptions, images, prices, and availability are
            accurate. However, errors may occasionally occur.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700">
            Eimah Ltd reserves the right to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Correct pricing or product information errors.</li>
            <li>Update product availability without prior notice.</li>
            <li>Modify or discontinue any product at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            4. Orders
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            All orders are subject to confirmation and availability.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Once an order is successfully placed, you will receive an order confirmation. This
            confirmation does not guarantee acceptance of the order. Eimah Ltd reserves the right to
            decline or cancel any order where necessary, including cases involving pricing errors,
            suspected fraud, or unavailable products.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            5. Payment
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Payment must be completed before an order is processed.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            We accept the payment methods displayed during checkout. All payments are processed
            securely through our approved payment partners.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            6. Delivery
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Orders are processed and delivered in accordance with our{" "}
            <Link to="/delivery-policy" className="underline font-medium hover:text-black">
              Delivery Policy
            </Link>
            .
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Delivery timelines are estimates and may vary depending on your location, courier
            availability, weather conditions, public holidays, or other unforeseen circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            7. Returns and Refunds
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Returns and refunds are governed by our{" "}
            <Link to="/refund-policy" className="underline font-medium hover:text-black">
              Returns & Refund Policy
            </Link>
            . Customers are encouraged to review the policy before making a purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            8. Customer Responsibilities
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">Customers are responsible for:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Providing accurate delivery and contact information.</li>
            <li>Ensuring someone is available to receive the order where applicable.</li>
            <li>Reviewing product details before completing a purchase.</li>
            <li>Keeping account information secure.</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-black">
            Eimah Ltd will not be responsible for delays or failed deliveries resulting from incorrect
            information provided by the customer.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            9. Intellectual Property
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            All content on this website, including text, logos, graphics, images, and other materials,
            is the property of Eimah Ltd unless otherwise stated.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
            No content may be copied, reproduced, distributed, or used without prior written
            permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            10. Limitation of Liability
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            To the fullest extent permitted by applicable law, Eimah Ltd shall not be liable for any
            indirect, incidental, or consequential loss arising from the use of our website, products,
            or services.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Our liability, where applicable, shall not exceed the amount paid for the affected order.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            11. Changes to These Terms
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd may update these Terms & Conditions from time to time. Any changes will become
            effective once published on this website. Customers are encouraged to review these Terms
            periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            12. Governing Law
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            These Terms & Conditions shall be governed and interpreted in accordance with the laws of
            the Federal Republic of Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            13. Contact Us
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            If you have any questions regarding these Terms & Conditions, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
            </Link>{" "}
            through the contact information provided on our website.
          </p>
          <div className="mt-4 p-4 border border-neutral-200 bg-neutral-50 text-sm font-mono space-y-2 text-neutral-800 rounded">
            <div>
              WhatsApp:{" "}
              <a
                href="https://wa.me/2349071464295"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-black"
              >
                +234 9071 464 295
              </a>
            </div>
            <div>
              Email:{" "}
              <a href="mailto:hello@eimah.com" className="underline hover:text-black">
                hello@eimah.com
              </a>
            </div>
            <div>
              Contact Page:{" "}
              <Link to="/contact" className="underline hover:text-black">
                eimah.com/contact
              </Link>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
