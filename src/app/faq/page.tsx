export const metadata = {
  title: "FAQ – Awajimaa Schools",
  description:
    "Frequently asked questions about the Awajimaa Schools platform — admissions, fees, accounts, and support.",
};

const faqs = [
  {
    question: "What is Awajimaa Schools?",
    answer:
      "Awajimaa Schools is a comprehensive school management platform built for schools and institutions. It handles student admissions, fee collection, attendance tracking, HR management, report cards, and more — all in one place.",
  },
  {
    question: "How do I register my school on the platform?",
    answer:
      "Visit https://www.awajimaaschools.com and click 'Get Started'. Complete the school registration form with your institution's details. Once verified, your school administrator will receive login credentials via email.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a trial period for new schools. Contact our support team at admin@awajimaaschools.com to learn more about trial options tailored to your school's size.",
  },
  {
    question: "How do I add students to the platform?",
    answer:
      "After logging in as a school administrator, navigate to the Admissions section. You can add students individually or use the bulk upload feature to import multiple students at once via a CSV file.",
  },
  {
    question: "How are fees collected through the platform?",
    answer:
      "Awajimaa Schools supports fee payments via Paystack (card, bank transfer, USSD) and Stripe. Parents and guardians receive payment links and can pay securely online. Receipts are automatically issued upon successful payment.",
  },
  {
    question: "Can parents track their child's attendance and grades?",
    answer:
      "Yes. Parents and guardians have a dedicated portal where they can view attendance records, academic results, report cards, fee payment history, and school announcements.",
  },
  {
    question: "How do teachers take attendance?",
    answer:
      "Teachers log in to their dashboard and navigate to the Attendance section. They can mark students present, absent, or late for each class period. Attendance records are stored and visible to administrators and parents.",
  },
  {
    question: "What happens if I forget my password?",
    answer:
      "Click 'Forgot Password' on the login page and enter your registered email address. A password reset link will be sent to your inbox. If you don't receive it, check your spam folder or contact admin@awajimaaschools.com.",
  },
  {
    question: "How do I generate report cards?",
    answer:
      "School administrators and class teachers can generate and download report cards from the Reports section. Results are compiled from scores entered by subject teachers across all terms.",
  },
  {
    question: "Is student data secure?",
    answer:
      "Yes. All data is encrypted in transit and at rest. We follow industry-standard security practices and comply with applicable data protection regulations to safeguard student and staff information.",
  },
  {
    question: "Can I manage multiple school branches?",
    answer:
      "Yes, Awajimaa Schools supports multi-branch management. A central administrator can oversee all branches, while each branch retains its own independent data and staff access.",
  },
  {
    question: "What are your support hours?",
    answer:
      "Our support team is available Monday to Saturday, 10:00 AM – 4:00 PM (WAT). You can reach us by email at admin@awajimaaschools.com, by phone at +234 703 884 3102 (Nigeria) or +1 (917) 821-8640 (US), or via WhatsApp.",
  },
  {
    question: "How do I contact Awajimaa Schools?",
    answer:
      "Email: admin@awajimaaschools.com\nNigeria: +234 703 884 3102\nUS: +1 (917) 821-8640\nUS Office: 16501 Shady Grove Road, Suite 8885 Gaithersburg, MD 20898 USA \nNigeria Office: Techcreek, ICT Center, Opposite Pleasure Park, Port Harcourt, Nigeria",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Can&apos;t find an answer? Email us at{" "}
          <a
            href="mailto:admin@awajimaaschools.com"
            className="text-brand hover:underline"
          >
            admin@awajimaaschools.com
          </a>
        </p>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <section
              key={index}
              className="border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {faq.question}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl bg-gray-50 dark:bg-gray-900 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Reach our support team directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
            <a
              href="mailto:admin@awajimaaschools.com"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-white font-medium hover:bg-brand/90 transition-colors"
            >
              Email Support
            </a>
            <a
              href="https://whatsapp.com/channel/0029Va9imXKFMqrb3qX1SR2T"
              // href="https://wa.me/19178218640"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
