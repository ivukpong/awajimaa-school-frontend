import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MapPin, School, Calendar, Users } from "lucide-react";

async function fetchCurrentlyAdmittingSchools() {
  const res = await fetch("/api/public/currently-admitting-schools");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.data;
}

export default function AdmissionsPage() {
  // SSR fallback: useSWR or react-query preferred for real app
  const [schools, setSchools] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch("/api/public/currently-admitting-schools")
      .then((r) => r.json())
      .then((d) => setSchools(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-orange-600 mb-2 text-center">
          Schools Currently Admitting
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Browse schools with open admissions and apply directly.
        </p>
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : schools.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No schools are currently admitting.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schools.map(({ school, session }) => (
              <Card key={session.id} className="p-6 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  {school.logo && (
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  )}
                  <div>
                    <h2 className="font-bold text-lg text-orange-700 flex items-center gap-1">
                      <School className="h-5 w-5" /> {school.name}
                    </h2>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {school.address}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <strong>Session:</strong> {session.name}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <strong>Open:</strong> {session.open_date} <strong>to</strong>{" "}
                  {session.close_date}
                </div>
                {session.application_fee > 0 && (
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>Application Fee:</strong> ₦{session.application_fee}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Link href={`/register?school=${school.id}`}>
                      Apply Now
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/schools/${school.id}`}>View School</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
