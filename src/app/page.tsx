import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { MobileNav } from "@/components/ui/MobileNav";
import {
  GraduationCap,
  Building2,
  HeartHandshake,
  Briefcase,
  School,
  Users,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ChevronRight,
  Star,
  BookOpen,
  BarChart3,
  Shield,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ───────────── NAV ───────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={36} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-brand transition-colors">
              Features
            </a>
            <a href="#who" className="hover:text-brand transition-colors">
              Who We Serve
            </a>
            <a href="#contact" className="hover:text-brand transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                className="hidden sm:inline-flex border-brand/40 text-brand hover:bg-brand/10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="hidden sm:inline-flex bg-brand hover:bg-brand-dark text-white">
                Get Started
              </Button>
            </Link>
            {/* Mobile nav toggle */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-gold text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6TTYgNHY2aDZWNEg2em0wIDMwdjZoNnYtNkg2em0yNCAwaC02djZoNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
            Trusted by schools across Nigeria & the Diaspora
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            The Smart Platform for
            <br />
            <span className="text-brand-gold">Modern School Management</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Awajimaa empowers schools, parents, students, teachers, sponsors,
            and regulators with a single connected platform — from admissions to
            payroll, e-learning to scholarships.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register?role=school_admin">
              <Button
                size="lg"
                className="bg-white text-brand hover:bg-brand/10 font-bold shadow-lg px-8"
              >
                Register Your School
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/admissions">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-bold px-8"
              >
                Browse Schools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── STATS ───────────── */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              value: "500+",
              label: "Schools Registered",
              icon: <School className="h-6 w-6 text-brand" />,
            },
            {
              value: "20k+",
              label: "Students Enrolled",
              icon: <GraduationCap className="h-6 w-6 text-brand" />,
            },
            {
              value: "36",
              label: "States Covered",
              icon: <Globe className="h-6 w-6 text-brand" />,
            },
            {
              value: "99%",
              label: "Uptime Reliability",
              icon: <Shield className="h-6 w-6 text-brand" />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center"
            >
              {s.icon}
              <p className="text-3xl font-extrabold text-gray-900 mt-2">
                {s.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ───────────── FEATURES ───────────── */}
      <section id="features" className="bg-brand/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">
              Platform Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
              Everything a school needs, in one place
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              From student enrollment to payroll, from exam results to
              government compliance — we handle it all.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <GraduationCap className="h-7 w-7 text-brand" />,
                title: "Student Management",
                desc: "Admissions, profiles, attendance, results, fees — all in one dashboard.",
              },
              {
                icon: <Users className="h-7 w-7 text-brand" />,
                title: "HR & Payroll",
                desc: "Hire teachers, manage leave, run payroll, and track staff performance.",
              },
              {
                icon: <BookOpen className="h-7 w-7 text-brand" />,
                title: "E-Learning",
                desc: "Upload lessons, assign coursework, and track student progress digitally.",
              },
              {
                icon: <BarChart3 className="h-7 w-7 text-brand" />,
                title: "Reports & Analytics",
                desc: "Real-time reports for school admins, parents, regulators, and sponsors.",
              },
              {
                icon: <HeartHandshake className="h-7 w-7 text-brand" />,
                title: "Scholarships & Sponsorships",
                desc: "Connect students with sponsors and manage scholarship programs seamlessly.",
              },
              {
                icon: <Shield className="h-7 w-7 text-brand" />,
                title: "Government Compliance",
                desc: "Built-in tools for state/LGA regulators — approvals, charges, and reporting.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-brand/20 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── WHO WE SERVE ───────────── */}
      <section
        id="who"
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-14">
          <span className="text-brand font-semibold text-sm uppercase tracking-wider">
            For Everyone in Education
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
            Who is Awajimaa for?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: <Building2 className="h-10 w-10 text-white" />,
              title: "Schools & Administrators",
              desc: "Register your school, manage branches, students, teachers, fees, exams, inventory, and comply with government requirements.",
              href: "/register?role=school_admin",
              cta: "Register Your School",
              bg: "bg-brand",
            },
            {
              icon: <GraduationCap className="h-10 w-10 text-white" />,
              title: "Parents & Students",
              desc: "Track your child's performance, pay fees, view timetables, and receive real-time school announcements.",
              href: "/register?role=parent",
              cta: "Join as a Parent",
              bg: "bg-brand-dark",
            },
            {
              icon: <HeartHandshake className="h-10 w-10 text-white" />,
              title: "Sponsors & Donors",
              desc: "Support a student's education, fund scholarships, and receive transparent progress reports from beneficiaries.",
              href: "/register?role=sponsor",
              cta: "Become a Sponsor",
              bg: "bg-green-500",
            },
            {
              icon: <Briefcase className="h-10 w-10 text-white" />,
              title: "Freelance Teachers",
              desc: "Build your teaching profile, discover teaching gigs across registered schools, and manage your engagements.",
              href: "/freelancer-teacher/recruitment",
              cta: "Browse Teaching Gigs",
              bg: "bg-blue-500",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div
                className={`h-16 w-16 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{card.desc}</p>
                <Link href={card.href}>
                  <Button className="bg-brand hover:bg-brand-dark text-white text-sm px-4 py-2 h-auto">
                    {card.cta} <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── CTA BANNER ───────────── */}
      <section className="bg-brand-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to transform your school?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join hundreds of schools already managing their operations smarter
            with Awajimaa.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register?role=school_admin">
              <Button
                size="lg"
                className="bg-brand hover:bg-brand-dark text-white font-bold px-8"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/admissions">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8"
              >
                Explore Schools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── CONTACT ───────────── */}
      <section id="contact" className="bg-brand/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">
              Get In Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
              We&apos;re here to help
            </h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Reach us via email, phone, or social media. We have offices in
              Nigeria and the United States.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Emails */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand/20">
              <div className="h-11 w-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Email Us</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <a
                  href="mailto:support@awajimaaschools.com"
                  className="flex items-center gap-2 hover:text-brand transition-colors"
                >
                  support@awajimaaschools.com
                </a>
                <a
                  href="mailto:Lumgwunsolutions@gmail.com"
                  className="flex items-center gap-2 hover:text-brand transition-colors"
                >
                  Lumgwunsolutions@gmail.com
                </a>
              </div>
            </div>
            {/* Phone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand/20">
              <div className="h-11 w-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Call Us</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <a
                  href="tel:+2347038843102"
                  className="flex items-center gap-2 hover:text-brand transition-colors"
                >
                  🇳🇬 +234 703 884 3102
                </a>
                <a
                  href="tel:+19178218640"
                  className="flex items-center gap-2 hover:text-brand transition-colors"
                >
                  🇺🇸 +1 (917) 821-8640
                </a>
              </div>
            </div>
            {/* Addresses */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand/20">
              <div className="h-11 w-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Our Offices</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>🇺🇸 3570 Chiswick Court, Rockville, Maryland, USA</p>
                <p>
                  🇳🇬 Techcreek, ICT Center, Opposite Pleasure Park, Port
                  Harcourt, Nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand/20 text-center">
            <h3 className="font-bold text-gray-900 mb-2">Connect with Us</h3>
            <p className="text-sm text-gray-500 mb-6">
              Follow Awajimaa and Lumgwun Solutions on social media
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                {
                  href: "https://www.facebook.com/LUMGWUNSOLUTIONS",
                  label: "Facebook",
                  icon: <Facebook className="h-4 w-4" />,
                  color: "bg-blue-600",
                },
                {
                  href: "https://x.com/awajimaaApp",
                  label: "X / Twitter",
                  icon: <Twitter className="h-4 w-4" />,
                  color: "bg-gray-900",
                },
                {
                  href: "https://www.instagram.com/lumgwunsolutionsgroup",
                  label: "Instagram",
                  icon: <Instagram className="h-4 w-4" />,
                  color: "bg-pink-600",
                },
                {
                  href: "https://www.linkedin.com/company/lumgwun-solutions-group/",
                  label: "LinkedIn",
                  icon: <Linkedin className="h-4 w-4" />,
                  color: "bg-blue-700",
                },
                {
                  href: "https://wa.me/19178218640",
                  label: "WhatsApp",
                  icon: <Phone className="h-4 w-4" />,
                  color: "bg-green-500",
                },
                {
                  href: "https://t.me/+iGtRjRiD4X5mODg0",
                  label: "Telegram",
                  icon: <Globe className="h-4 w-4" />,
                  color: "bg-sky-500",
                },
                {
                  href: "https://tiktok.com/@lumgwun.solutions",
                  label: "TikTok",
                  icon: <Youtube className="h-4 w-4" />,
                  color: "bg-gray-900",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 ${s.color} text-white rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity`}
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-brand-navy text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo height={36} onDark />
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                A product of{" "}
                <strong className="text-white">Lumgwun Solutions Group</strong>{" "}
                — empowering education across Africa and the diaspora.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/admissions"
                    className="hover:text-brand-gold transition-colors"
                  >
                    Schools Admitting
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?role=school_admin"
                    className="hover:text-brand-gold transition-colors"
                  >
                    Register a School
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?role=parent"
                    className="hover:text-brand-gold transition-colors"
                  >
                    Register a Child
                  </Link>
                </li>
                <li>
                  <Link
                    href="/freelancer-teacher/recruitment"
                    className="hover:text-brand-gold transition-colors"
                  >
                    Teaching Gigs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-brand-gold transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Our Websites</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.awajimaaschools.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-gold transition-colors"
                  >
                    awajimaaschools.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://lumgwunsolutions.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-gold transition-colors"
                  >
                    lumgwunsolutions.com
                  </a>
                </li>
              </ul>
              <h4 className="text-white font-semibold mt-6 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-brand-gold transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-brand-gold transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>
              &copy; {new Date().getFullYear()} Awajimaa School Platform. All
              rights reserved.
            </p>
            <p>
              Developed by{" "}
              <a
                href="https://lumgwunsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                Lumgwun Solutions Group
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
