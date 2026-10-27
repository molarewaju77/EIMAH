import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/company-policy")({
  component: CompanyPolicyPage,
  head: () => ({
    meta: [
      { title: "Company Policy — EIMAH" },
      {
        name: "description",
        content:
          "We are committed to providing quality products, reliable service, and seamless shopping experience. This Company Policy outlines our operational standards and principles.",
      },
    ],
  }),
});

function CompanyPolicyPage() {
  return (
    <LegalLayout
      title="Company Policy"
      subtitle="The operational standards, service commitments, and principles that guide Eimah Ltd."
      lastUpdated="September 2026"
      currentPath="/company-policy"
    >
      <div className="space-y-10">
        <section>
          <p className="lead text-base sm:text-lg text-neutral-800 font-normal leading-relaxed">
            We are committed to providing quality products, reliable service, and seamless shopping
            experience. This Company Policy outlines the standards and principles that guide us to
            how we serve our customers and operate our business in accordance with our{" "}
            <Link to="/terms" className="underline font-medium hover:text-black">
              Terms & Conditions
            </Link>
            .
          </p>
        </section>

        <hr className="border-neutral-200 my-8" />

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            1. Our Commitment
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd is dedicated to offering carefully selected products that combine quality,
            functionality, and purpose.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            We continuously review our products and services to ensure they meet the expectations of
            our customers.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            2. Product Quality Policy
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We are committed to maintaining high standards in product selection and customer
            satisfaction.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700">
            Before products are made available, we consider factors such as:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Product quality and reliability.</li>
            <li>Functionality and usefulness.</li>
            <li>Customer needs and experience.</li>
          </ul>
          <p className="mt-3 text-sm sm:text-base text-neutral-700 leading-relaxed">
            While we carefully inspect products before dispatch, customers are encouraged to review
            product details and care instructions before purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            3. Customer Service Policy
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We aim to provide a positive and supportive experience for every customer.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700">
            Our customer service commitment includes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Providing clear and accurate information about our products.</li>
            <li>Responding to customer enquiries in a timely manner.</li>
            <li>Handling concerns and complaints fairly and professionally.</li>
            <li>Continuously improving our services based on customer feedback.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            4. Pricing Policy
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd strives to provide fair and transparent pricing for all products.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Prices displayed on our website are subject to change due to factors such as availability,
            supplier costs, promotions, or market conditions.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Any applicable charges, including delivery fees, will be communicated before order
            completion.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            5. Order Accuracy Policy
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We take care to ensure that orders are accurately prepared and fulfilled.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers are responsible for providing correct order and delivery information during
            checkout. Where an error occurs from our side, we will review the situation and provide an
            appropriate resolution.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            6. Communication Policy
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We communicate with customers through our official channels to provide updates regarding
            orders, promotions, and customer support.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers should ensure that their contact information is accurate to receive important
            notifications.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            7. Privacy and Confidentiality
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd respects customer privacy and handles personal information responsibly in
            accordance with our{" "}
            <Link to="/privacy" className="underline font-medium hover:text-black">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customer information collected during transactions is used only for purposes related to
            order processing, service improvement, and communication in accordance with applicable
            privacy requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            8. Feedback and Complaints
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customer feedback helps us improve our products and services.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers are encouraged to share their experiences, suggestions, or concerns. All
            complaints will be reviewed and handled professionally.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            9. Policy Updates
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd reserves the right to update this Company Policy when necessary to reflect
            improvements in our operations, services, or business practices.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Any updates will be published on this website.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            10. Contact Us
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            For questions, feedback, or further information about our policies, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
            </Link>{" "}
            through the official contact details provided on our website.
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
