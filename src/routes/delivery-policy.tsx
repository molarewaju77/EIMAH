import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/delivery-policy")({
  component: DeliveryPolicyPage,
  head: () => ({
    meta: [
      { title: "Delivery Policy — EIMAH" },
      {
        name: "description",
        content:
          "We are committed to delivering your orders safely and efficiently. This Delivery Policy explains how we process, ship, and fulfil orders.",
      },
    ],
  }),
});

function DeliveryPolicyPage() {
  return (
    <LegalLayout
      title="Delivery Policy"
      subtitle="How we process, ship, and fulfil orders placed through the Eimah platform."
      lastUpdated="September 2026"
      currentPath="/delivery-policy"
    >
      <div className="space-y-10">
        <section>
          <p className="lead text-base sm:text-lg text-neutral-800 font-normal leading-relaxed">
            We are committed to delivering your orders safely and efficiently. This Delivery Policy
            explains how we process, ship, and fulfil orders placed through our website in accordance
            with our{" "}
            <Link to="/terms" className="underline font-medium hover:text-black">
              Terms & Conditions
            </Link>
            .
          </p>
        </section>

        <hr className="border-neutral-200 my-8" />

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            1. Order Processing
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Orders are processed after successful payment confirmation.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Orders placed outside our business hours, on weekends, or on public holidays will be
            processed on the next business day.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers will receive an order confirmation once their order has been successfully placed.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            2. Delivery Methods
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Eimah Ltd offers the following delivery options:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>
              <strong>Courier Delivery:</strong> Orders are delivered to the delivery address
              provided during checkout.
            </li>
            <li>
              <strong>Pickup Station:</strong> Customers may choose to collect their orders from our
              designated pickup station after receiving a collection notification.
            </li>
          </ul>
          <p className="mt-3 text-sm sm:text-base text-neutral-700">
            The available delivery options will be displayed during checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            3. Delivery Time
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Delivery times vary depending on the customer's location and the selected delivery
            method.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Estimated delivery timelines are provided as a guide and may be affected by factors
            beyond our control, including courier operations, weather conditions, public holidays,
            or other unforeseen circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            4. Shipping Fees
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Delivery charges are calculated based on factors such as delivery location, package size,
            weight, and the selected delivery method.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Applicable shipping fees will be displayed before payment is completed.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            5. Delivery Information
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers are responsible for providing accurate delivery details, including their full
            name, phone number, and delivery address.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Incorrect or incomplete information may result in delivery delays or unsuccessful
            deliveries.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            6. Order Tracking
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Where tracking is available, customers will receive updates on the status of their
            orders via our{" "}
            <Link to="/track" className="underline font-medium hover:text-black">
              Order Tracking
            </Link>{" "}
            page.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers may also{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact our support team
            </Link>{" "}
            for assistance regarding their delivery.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            7. Pickup Station Orders
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers who choose the pickup station option will be notified once their order is ready
            for collection.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Orders should only be collected after receiving our confirmation. Customers may be
            required to present their order confirmation or a valid means of identification before
            collection.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            8. Delays and Failed Deliveries
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            While we aim to deliver all orders within the estimated timeframe, delays may occasionally
            occur due to circumstances beyond our control.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            If a delivery cannot be completed because of incorrect customer information, the
            customer's unavailability, or failure to collect a pickup order within the communicated
            period, additional delivery arrangements or charges may apply.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            9. Damaged or Missing Items
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Customers should inspect their orders upon delivery or collection.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            If an item is received damaged, defective, or incomplete, the customer should notify Eimah
            Ltd as soon as reasonably possible so that the issue can be investigated and resolved in
            accordance with our{" "}
            <Link to="/refund-policy" className="underline font-medium hover:text-black">
              Returns & Refund Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            10. Contact Us
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            If you have any questions about your delivery or require assistance with an order, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
            </Link>{" "}
            using the contact information provided on our website.
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
              Track Order:{" "}
              <Link to="/track" className="underline hover:text-black">
                eimah.com/track
              </Link>
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
