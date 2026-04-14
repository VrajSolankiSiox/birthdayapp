import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizeAnniversary(doc: any) {
  return {
    id: doc._id?.toString() ?? doc.id,
    name: doc.name ?? "",
    email: doc.email ?? "",
    company: doc.company ?? "",
    jobTitle: doc.jobTitle ?? "",
    department: doc.department ?? doc.sector ?? "",
    month: doc.month,
    day: doc.day,
    year: doc.year ?? undefined,
    createdAt: doc.createdAt ?? undefined,
  };
}

export async function GET() {
  try {
    const collections = ["anniversaries", "Anniversary", "anniversary"];
    let anniversaries: any[] = [];

    for (const collection of collections) {
      try {
        const result = await prisma.$runCommandRaw({
          find: collection,
          filter: {},
          sort: { month: 1, day: 1 },
        }) as any;

        const docs = result?.cursor?.firstBatch;
        if (Array.isArray(docs) && docs.length > 0) {
          anniversaries = docs.map(normalizeAnniversary);
          break;
        }
      } catch (error) {
        // Ignore collection not found or other raw command errors and try the next name
      }
    }

    return NextResponse.json({ success: true, data: anniversaries });
  } catch (error) {
    console.error('Error fetching anniversaries:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, jobTitle, department, month, day, year } = body;

    if (!jobTitle || !department || !month || !day) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job Title, Department, Month, and Day are required' 
      }, { status: 400 });
    }

    const newAnniversary = await prisma.anniversary.create({
      data: {
        name,
        email,
        company,
        jobTitle,
        department,
        month: parseInt(month),
        day: parseInt(day),
        year: year ? parseInt(year) : null
      }
    });

    return NextResponse.json({ success: true, data: newAnniversary }, { status: 201 });
  } catch (error) {
    console.error('Error creating anniversary:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
