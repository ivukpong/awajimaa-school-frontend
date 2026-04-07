export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when
              you create an account, enrol a student, or contact us for support.
              This includes names, email addresses, phone numbers, and school or
              institution details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to operate and improve the
              platform, process transactions, send notifications, and comply
              with legal obligations. We do not sell your personal information
              to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Data Sharing
            </h2>
            <p>
              We may share your information with service providers who assist us
              in operating the platform (such as payment processors and cloud
              hosting providers), under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Data Retention
            </h2>
            <p>
              We retain your information for as long as your account is active
              or as needed to provide services, comply with legal obligations,
              and resolve disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Security
            </h2>
            <p>
              We implement industry-standard security measures including
              encryption in transit (TLS), hashed passwords, and role-based
              access controls to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal
              data. To exercise these rights, please contact us at{" "}
              <a
                href="mailto:admin@awajimaaschools.com"
                className="text-brand hover:underline"
              >
                admin@awajimaaschools.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="admin@awajimaaschools.com"
                className="text-brand hover:underline"
              >
                admin@awajimaaschools.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
