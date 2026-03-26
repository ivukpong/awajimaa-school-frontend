import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Building2,
  HeartHandshake,
  Briefcase,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-4">
          Welcome to Awajimaa School Platform
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Empowering learning, teaching, and school management across Nigeria.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <HeartHandshake className="h-10 w-10 text-orange-500 mb-2" />
            <h2 className="font-bold text-lg mb-2">Become a Student Sponsor</h2>
            <p className="text-gray-600 mb-4">
              Support a child's education and make a difference today.
            </p>
            <Button asChild className="w-full">
              <Link href="/sponsor">Sponsor a Student</Link>
            </Button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <GraduationCap className="h-10 w-10 text-orange-500 mb-2" />
            <h2 className="font-bold text-lg mb-2">Register Your Child</h2>
            <p className="text-gray-600 mb-4">
              Give your child access to quality schools and opportunities.
            </p>
            <Button asChild className="w-full">
              <Link href="/register?role=parent">Register Your Child</Link>
            </Button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Building2 className="h-10 w-10 text-orange-500 mb-2" />
            <h2 className="font-bold text-lg mb-2">Register Your School</h2>
            <p className="text-gray-600 mb-4">
              Join the Awajimaa network and manage your school online.
            </p>
            <Button asChild className="w-full">
              <Link href="/register?role=school_admin">
                Register Your School
              </Link>
            </Button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Briefcase className="h-10 w-10 text-orange-500 mb-2" />
            <h2 className="font-bold text-lg mb-2">Teaching Gigs</h2>
            <p className="text-gray-600 mb-4">
              Find and apply for teaching jobs across registered schools.
            </p>
            <Button asChild className="w-full">
              <Link href="/freelancer-teacher/recruitment">
                View Teaching Gigs
              </Link>
            </Button>
          </div>
        </div>
        <div className="bg-orange-100 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-orange-700 mb-2">
            Explore Registered Schools, States & LGAs
          </h3>
          <p className="text-gray-700 mb-4">
            Browse our growing network of schools, discover opportunities by
            state or LGA, and connect with education partners.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              className="border-orange-400 text-orange-700"
            >
              <Link href="/admissions">Schools Currently Admitting</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-orange-400 text-orange-700"
            >
              <Link href="/regulator/schools">View All Schools</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-orange-400 text-orange-700"
            >
              <Link href="/register?role=school_admin">List Your School</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-orange-400 text-orange-700"
            >
              <Link href="/register?role=parent">Find Schools by State</Link>
            </Button>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-8">
          &copy; {new Date().getFullYear()} Awajimaa School Platform
        </p>
      </div>
    </main>
  );
}
