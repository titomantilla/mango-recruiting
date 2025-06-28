'use client';

import Link from 'next/link';

export default function CandidateCard({
  id,
  fullName,
  technicalProfile,
  seniority,
  mainTechnologies,
}) {
  return (
    <Link href={`/candidates/${id}`}>
      <div className="cursor-pointer border border-gray-700 p-4 rounded-lg mb-4 hover:bg-gray-700 transition">
        <h2 className="text-xl font-semibold text-white">{fullName}</h2>
        <p className="text-gray-400"><strong>Perfil:</strong> {technicalProfile}</p>
        <p className="text-gray-400"><strong>Seniority:</strong> {seniority}</p>
        <p className="text-gray-400"><strong>Tecnologías:</strong> {mainTechnologies}</p>
      </div>
    </Link>
  );
}
