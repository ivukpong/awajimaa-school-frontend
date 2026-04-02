export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Terms and Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By registering for or using the Awajimaa platform, you agree to be
              bound by these Terms and Conditions. If you do not agree, please
              do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Use of the Platform
            </h2>
            <p>
              The platform is intended for educational institutions, teachers,
              students, parents, and other stakeholders in the education sector.
              You agree to use the platform only for lawful purposes and in
              accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Account Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. Notify us immediately at{" "}
              <a
                href="mailto:support@awajimaa.com"
                className="text-brand hover:underline"
              >
                support@awajimaa.com
              </a>{" "}
              if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Payments and Fees
            </h2>
            <p>
              Subscription fees, government charges, and other payments
              processed through this platform are non-refundable unless
              otherwise stated in writing. All fees are displayed in Nigerian
              Naira (NGN) unless otherwise specified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Intellectual Property
            </h2>
            <p>
              All content, branding, and software on the platform are the
              intellectual property of Awajimaa or its licensors. You may not
              reproduce, distribute, or create derivative works without prior
              written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              Awajimaa is not liable for any indirect, incidental, or
              consequential damages arising from your use of the platform,
              including data loss or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms, engage in fraudulent activity, or misuse the
              platform, with or without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              platform after changes are posted constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              9. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria. Any disputes shall be resolved in Nigerian courts of
              competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              10. Contact
            </h2>
            <p>
              For questions about these Terms, email{" "}
              <a
                href="mailto:legal@awajimaa.com"
                className="text-brand hover:underline"
              >
                legal@awajimaa.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
