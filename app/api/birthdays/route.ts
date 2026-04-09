import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const birthdays = await prisma.birthday.findMany({
      orderBy: [
        { month: 'asc' },
        { day: 'asc' }
      ]
    });
    return NextResponse.json({ success: true, data: birthdays });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, month, day, year, gender } = body;

    if (!name || !month || !day) {
      return NextResponse.json({ success: false, error: 'Name, month, and day are required' }, { status: 400 });
    }

    const newBirthday = await prisma.birthday.create({
      data: {
        name,
        month: parseInt(month),
        day: parseInt(day),
        year: year ? parseInt(year) : null,
        gender: gender || null
      }
    });

    return NextResponse.json({ success: true, data: newBirthday }, { status: 201 });
  } catch (error) {
    console.error('Error creating birthday:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
