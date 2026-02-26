export type MemberRole = 'customer' | 'president';

export interface Member {
  id: string;
  email: string;
  name?: string;
  role: MemberRole;
  prant?: string;
  addedAt: string;
  isNewMember?: boolean;
}

const MEMBERS_STORAGE_KEY = 'abgp-members';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const FIRST_NAMES = [
  'Ramesh', 'Priya', 'Vikram', 'Anita', 'Suresh', 'Lakshmi', 'Rajesh', 'Meera', 'Arun', 'Kavitha',
  'Deepak', 'Sunita', 'Manoj', 'Padmini', 'Kiran', 'Shobha', 'Sanjay', 'Rekha', 'Anil', 'Vandana',
  'Rahul', 'Neha', 'Amit', 'Swati', 'Vivek', 'Divya', 'Pradeep', 'Kavita', 'Naveen', 'Anjali',
  'Sandeep', 'Preeti', 'Ashok', 'Manju', 'Ravi', 'Pooja', 'Ganesh', 'Shanti', 'Mahesh', 'Latha',
];
const LAST_NAMES = [
  'Kumar', 'Sharma', 'Singh', 'Desai', 'Patel', 'Iyer', 'Nair', 'Krishnan', 'Menon', 'Reddy',
  'Pillai', 'Gupta', 'Rao', 'Joshi', 'Mishra', 'Shah', 'Verma', 'Dubey', 'Sinha', 'Mehta',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildSampleMembers(count: number): Array<{ name: string; email: string; isNewMember: boolean; daysAgo: number }> {
  const used = new Set<string>();
  const out: Array<{ name: string; email: string; isNewMember: boolean; daysAgo: number }> = [];
  for (let i = 0; i < count; i++) {
    let name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    let base = name.replace(/\s+/g, '.').toLowerCase();
    let email = `${base}@email.com`;
    let c = 0;
    while (used.has(email)) {
      email = `${base}${++c}@email.com`;
    }
    used.add(email);
    out.push({
      name,
      email,
      isNewMember: Math.random() < 0.5,
      daysAgo: Math.floor(Math.random() * 250),
    });
  }
  return out;
}

const SAMPLE_MEMBERS = buildSampleMembers(50);

function saveMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}

function seedSampleMembers(): Member[] {
  const now = Date.now();
  const members: Member[] = SAMPLE_MEMBERS.map((s, i) => ({
    id: `seed-${i + 1}-${generateId()}`,
    email: s.email,
    name: s.name,
    role: 'customer' as const,
    addedAt: new Date(now - s.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    isNewMember: s.isNewMember,
  }));
  saveMembers(members);
  return members;
}

export const RAM_PATIL_EMAIL = 'ram.patil@email.com';

function ensureRamPatilInList(members: Member[]): Member[] {
  if (members.some((m) => m.email.toLowerCase() === RAM_PATIL_EMAIL)) return members;
  const ramPatil: Member = {
    id: generateId(),
    email: RAM_PATIL_EMAIL,
    name: 'Ram Patil',
    role: 'customer',
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isNewMember: false,
  };
  saveMembers([ramPatil, ...members]);
  return [ramPatil, ...members];
}

export function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) {
      return ensureRamPatilInList(seedSampleMembers());
    }
    const parsed = JSON.parse(raw) as Member[];
    const list = Array.isArray(parsed) ? parsed : [];
    if (list.length === 0) {
      return ensureRamPatilInList(seedSampleMembers());
    }
    return ensureRamPatilInList(list);
  } catch {
    return [];
  }
}

export function addMember(data: {
  email: string;
  name?: string;
  role: MemberRole;
  prant?: string;
  isNewMember?: boolean;
}): Member {
  const members = loadMembers();
  const existing = members.find((m) => m.email.toLowerCase() === data.email.toLowerCase());
  const now = new Date().toISOString();
  if (existing) {
    const updated: Member = {
      ...existing,
      name: data.name ?? existing.name,
      role: data.role,
      prant: data.prant ?? existing.prant,
      addedAt: existing.addedAt,
      isNewMember: data.isNewMember ?? existing.isNewMember ?? false,
    };
    const next = members.map((m) => (m.id === existing.id ? updated : m));
    saveMembers(next);
    return updated;
  }
  const member: Member = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role,
    prant: data.prant,
    addedAt: now,
    isNewMember: data.isNewMember ?? true,
  };
  saveMembers([...members, member]);
  return member;
}

export function deleteMember(id: string): void {
  const members = loadMembers().filter((m) => m.id !== id);
  saveMembers(members);
}

export function getMembers(): Member[] {
  return loadMembers();
}
