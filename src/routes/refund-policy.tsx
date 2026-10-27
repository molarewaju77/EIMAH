import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
  head: () => ({
    meta: [
      { title: "Returns & Exchange Policy — EIMAH" },
      {
        name: "description",
        content:
          "We are committed to ensuring that our customers receive quality products that meet their expectations. This Returns & Exchange Policy explains conditions for returns or exchanges.",
      },
    ],
  }),
});

function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Returns & Exchange Policy"
      subtitle="The conditions and guidelines under which returns or exchanges may be requested."
      lastUpdated="September 2026"
      currentPath="/refund-policy"
    >
      <div className="space-y-10">
        <section>
          <p className="lead text-base sm:text-lg text-neutral-800 font-normal leading-relaxed">
            We are committed to ensuring that our customers receive quality products that meet their
            expectations. This Returns & Exchange Policy explains the conditions under which returns
            or exchanges may be requested in accordance with our{" "}
            <Link to="/terms" className="underline font-medium hover:text-black">
              Terms & Conditions
            </Link>
            .
          </p>
        </section>

        <hr className="border-neutral-200 my-8" />

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            1. Eligibility for Returns or Exchanges
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Returns or exchanges may be accepted for items that:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Arrive damaged or defective.</li>
            <li>Are incorrect or different from the item ordered.</li>
            <li>Have a verified quality issue that affects the intended use of the product.</li>
          </ul>
          <div className="mt-4 p-4 border-l-4 border-black bg-neutral-100 text-sm text-neutral-800 space-y-2 rounded-r">
            <p>
              <strong>Reporting Deadline:</strong> All return or exchange requests must be reported
              within <strong>24 hours</strong> of delivery.
            </p>
            <p>
              <strong>Original Condition:</strong> Items must remain in their original condition,
              including packaging, labels, and accessories where applicable.
            </p>
            <p>
              <strong>Unboxing Video Requirement:</strong> For damaged or incorrect items, customers
              may be required to provide a clear unboxing video as part of the verification process
              before a return or exchange request can be approved.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            2. Items Not Eligible for Return or Exchange
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Returns or exchanges will not be accepted for:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Items that have been used, altered, or damaged after delivery.</li>
            <li>
              Products damaged due to improper handling, misuse, or failure to follow care
              instructions.
            </li>
            <li>
              Items returned due to a change of mind, personal preference, or incorrect selection by
              the customer.
            </li>
            <li>
              Items purchased during clearance or final sale, except where the item received is
              damaged or incorrect.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            3. Reporting an Issue
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            If you receive a damaged, defective, or incorrect item, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact our customer support team
            </Link>{" "}
            within 24 hours of receiving your order.
          </p>
          <p className="mt-3 text-sm sm:text-base text-neutral-700">
            To help us review your request efficiently, please provide:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Order number.</li>
            <li>Description of the issue.</li>
            <li>Clear photos or videos showing the condition of the item.</li>
            <li>
              Unboxing video showing the package and item condition upon delivery (where
              applicable).
            </li>
          </ul>
          <p className="mt-3 text-sm text-neutral-600">
            The provided information helps us verify the issue and determine the appropriate
            resolution.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            4. Review and Resolution
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Once your request has been reviewed and approved, Eimah Ltd may provide one of the
            following resolutions:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Replacement of the item, subject to availability.</li>
            <li>Exchange for another item of equal value.</li>
            <li>Other suitable solutions where applicable.</li>
          </ul>
          <p className="mt-3 text-sm text-neutral-600">
            All resolutions are subject to product availability and successful verification of the
            reported issue.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            5. Shipping Responsibility
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Where the issue is caused by Eimah Ltd, such as receiving a damaged or incorrect item, we
            will provide guidance on the return or replacement process.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            For approved exchanges or returns arising from customer-related reasons where applicable,
            the customer may be responsible for associated shipping costs.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            6. Processing Time
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Approved returns, exchanges, or replacements will be processed within{" "}
            <strong>24–72 business hours</strong> after the review process has been completed and the
            request has been approved.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Processing times may vary depending on product availability and delivery arrangements.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            7. Contact Us
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            For questions or assistance regarding your order, returns, or exchanges, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact our support team
            </Link>
            :
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
