import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — EIMAH" },
      {
        name: "description",
        content:
          "This Privacy Policy explains how EIMAH collects, uses, stores, and protects your personal data under the Nigeria Data Protection Act (NDPA).",
      },
    ],
  }),
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How EIMAH collects, uses, stores, and protects your personal data."
      lastUpdated="September 2026"
      currentPath="/privacy"
    >
      <div className="space-y-10">
        <section>
          <p className="lead text-base sm:text-lg text-neutral-800 font-normal leading-relaxed">
            This Privacy Policy explains how <strong>EIMAH</strong> collects, uses, stores, and
            protects your personal data when you visit or use our website, place an order, use our
            order tracking service,{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
            </Link>
            , or interact with us on social media in accordance with our{" "}
            <Link to="/terms" className="underline font-medium hover:text-black">
              Terms & Conditions
            </Link>
            .
          </p>
          <p className="mt-3 text-sm sm:text-base text-neutral-700 leading-relaxed">
            By using the EIMAH platform, you acknowledge that you have read and understood this policy.
            We are committed to handling your personal data responsibly and in accordance with
            applicable data protection law, including the <strong>Nigeria Data Protection Act (NDPA)</strong>{" "}
            and regulations issued by the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
          </p>
        </section>

        <hr className="border-neutral-200 my-8" />

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            1. Who We Are
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            EIMAH is a modern commerce platform that brings quality products closer to consumers and
            businesses. We operate two service lines:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm sm:text-base text-neutral-700">
            <li>
              <strong>EIMAH for Consumers</strong> — curating quality, functional, and timeless
              lifestyle products for everyday shoppers.
            </li>
            <li>
              <strong>EIMAH for Businesses</strong> — supporting entrepreneurs and businesses with
              sourcing, procurement, importation, and supplier verification.
            </li>
          </ul>
          <p className="mt-4 text-sm sm:text-base text-neutral-700 leading-relaxed">
            Our website is operated at <strong>eimah.com</strong>. Any personal data collected
            through our platform is controlled by EIMAH. For data-related enquiries,{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
            </Link>{" "}
            at the details provided in Section 9 of this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            2. The Data We Collect About You
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            Personal data means any information that can be used to identify you directly or
            indirectly. We collect your personal data in order to process your orders, deliver your
            purchases, and improve our services.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">Information You Provide to Us</h3>
          <p className="text-sm sm:text-base text-neutral-700">
            When you place an order, track a delivery, contact us, or interact with our platform, you
            may provide us with:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>
              <strong>Contact details:</strong> your name, delivery address, phone number, and email
              address.
            </li>
            <li>
              <strong>Order information:</strong> the products you purchase, quantities, and any
              special delivery instructions.
            </li>
            <li>
              <strong>Payment information:</strong> card details or payment reference numbers
              processed securely through our payment provider. We do not store full card details on our
              servers.
            </li>
            <li>
              <strong>Communications:</strong> messages or enquiries you send us via our contact form
              or social media.
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Information We Collect Automatically
          </h3>
          <p className="text-sm sm:text-base text-neutral-700">
            When you visit our website, we may automatically collect certain technical data, including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm sm:text-base text-neutral-700">
            <li>Your device type, browser, and IP address.</li>
            <li>Pages you visit, products you view, and how long you spend on each page.</li>
            <li>Referring website or search terms that brought you to our site.</li>
          </ul>
          <p className="mt-4 text-sm font-medium text-black">
            We collect only the data we need to serve you well. We do not sell your personal data to
            third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            3. How We Use Your Personal Data
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">
            We use your personal data only for the following purposes:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm sm:text-base text-neutral-700">
            <li>
              Processing and fulfilling your orders, including coordinating delivery through our
              logistics partner(s).
            </li>
            <li>Sending you order confirmations, shipping notifications, and delivery updates.</li>
            <li>
              Responding to your enquiries and providing customer support through our{" "}
              <Link to="/contact" className="underline hover:text-black">
                help team
              </Link>
              .
            </li>
            <li>Improving our website, products, and overall service quality.</li>
            <li>
              Sending you marketing communications about new products, promotions, or updates — only
              where you have opted to receive these.
            </li>
            <li>Complying with our legal and regulatory obligations under Nigerian law.</li>
            <li>Detecting and preventing fraud or misuse of our platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            4. Legal Basis for Processing Your Data
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">
            We will only process your personal data where we have a lawful basis to do so. Depending on
            how we use your data, the legal basis will be one of the following:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm sm:text-base text-neutral-700">
            <li>
              <strong>Consent:</strong> You have given us clear consent to process your data for a
              specific purpose, such as receiving marketing emails. You may withdraw your consent at
              any time.
            </li>
            <li>
              <strong>Contract:</strong> We need to process your data to fulfil your order or to take
              steps before entering a purchase with you in accordance with our{" "}
              <Link to="/terms" className="underline hover:text-black">
                Terms & Conditions
              </Link>
              .
            </li>
            <li>
              <strong>Legitimate interests:</strong> We have a legitimate reason to process your data,
              such as improving our services or detecting fraud, in a way that does not unfairly
              impact on your rights.
            </li>
            <li>
              <strong>Legal obligation:</strong> We are required to process your data to comply with a
              legal obligation under Nigerian law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            5. How We Share Your Personal Data
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">
            We do not sell your data. We may share your personal data only in the following limited
            circumstances:
          </p>

          <div className="space-y-4 mt-4 text-sm sm:text-base text-neutral-700">
            <div>
              <strong className="text-black block">Logistics Partners</strong>
              To deliver your order, we share your name, delivery address, and contact number with our
              logistics partner(s). These partners are contractually required to use your data solely
              for the purpose of fulfilling your delivery.
            </div>

            <div>
              <strong className="text-black block">Payment Processors</strong>
              Your payment is processed securely through our payment gateway provider. We share only
              the information necessary to complete your transaction. We do not store your full card
              details.
            </div>

            <div>
              <strong className="text-black block">Technology Service Providers</strong>
              We use third-party platforms to operate our website and services, including hosting and
              analytics tools. These providers access your data only as necessary to provide their
              services to us and are bound by confidentiality obligations.
            </div>

            <div>
              <strong className="text-black block">Legal Requirements</strong>
              We may disclose your personal data if required to do so by law, court order, or to
              protect the rights, safety, or property of EIMAH, our customers, or others.
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base text-neutral-700">
            We require all third parties we share data with to handle it in accordance with applicable
            data protection law and to use it only for the specified purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            6. How Long We Keep Your Data
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">
            We retain your personal data only for as long as is necessary to fulfil the purposes for
            which it was collected, including:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm sm:text-base text-neutral-700">
            <li>
              For as long as is necessary to complete and manage your orders and any returns or
              disputes arising from them.
            </li>
            <li>
              For the duration required by applicable Nigerian tax and financial record-keeping laws.
            </li>
            <li>Until you withdraw your consent or request deletion (for marketing data).</li>
          </ul>
          <p className="mt-3 text-sm sm:text-base text-neutral-700">
            When your data is no longer needed, we will securely delete or anonymise it. We will not
            retain your data in an identifiable form beyond what is required.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            7. Data Security
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We take the security of your personal data seriously. We have implemented reasonable
            technical and organisational measures to protect your data from unauthorised access, loss,
            misuse, alteration, or disclosure. These include:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm sm:text-base text-neutral-700">
            <li>Secure HTTPS encryption on our website.</li>
            <li>
              Payment processing through PCI-compliant third-party providers — we do not store raw card
              data.
            </li>
            <li>
              Restricting access to personal data to only those team members and service providers who
              need it to perform their role.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            8. Your Rights
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">
            Under the Nigeria Data Protection Act and applicable regulations, you have the following
            rights in relation to your personal data:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm sm:text-base text-neutral-700">
            <li>
              <strong>Right to access:</strong> you may request a copy of the personal data we hold
              about you.
            </li>
            <li>
              <strong>Right to correction:</strong> you may ask us to correct any inaccurate or
              incomplete data.
            </li>
            <li>
              <strong>Right to erasure:</strong> you may request that we delete your personal data
              where it is no longer necessary for the purposes we collected it, subject to legal
              retention requirements.
            </li>
            <li>
              <strong>Right to object:</strong> you may object to our processing of your data for
              direct marketing purposes at any time.
            </li>
            <li>
              <strong>Right to withdraw consent:</strong> where processing is based on your consent,
              you may withdraw it at any time without affecting the lawfulness of processing before
              withdrawal.
            </li>
          </ul>
          <p className="mt-4 text-sm sm:text-base text-neutral-700">
            To exercise any of these rights, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
            </Link>{" "}
            using the details below. We will respond to all valid requests within a reasonable time and
            in accordance with applicable law. We may ask you to verify your identity before
            processing your request.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            9. Contact Us
          </h2>
          <p className="text-sm sm:text-base text-neutral-700">
            If you have any questions, concerns, or requests relating to this Privacy Policy or how we
            handle your personal data, please{" "}
            <Link to="/contact" className="underline font-medium hover:text-black">
              contact us
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

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-4">
            10. Updates to This Policy
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our services,
            legal obligations, or data practices. When we do, we will update the effective date at the
            top of this document and, where the changes are significant, notify you directly via email
            or a notice on our website.
          </p>
          <p className="mt-2 text-sm sm:text-base text-neutral-700 leading-relaxed">
            We encourage you to review this policy periodically so you remain informed about how we
            protect your data.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
