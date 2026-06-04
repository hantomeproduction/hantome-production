# Original Song Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add original-song inquiry management to Hantome admin page so submitted Firebase records can be reviewed, filtered, status-managed, memoed, and exported.

**Architecture:** Keep existing Firebase/Auth structure. Public form writes to `original_song_inquiries`; authenticated admin page reads and updates same collection. Preserve current single-file `Admin.tsx` style unless later refactor requested.

**Tech Stack:** React, TypeScript, Vite, Firebase Auth, Firestore, Tailwind CDN classes, lucide-react.

---

## File Structure

- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/pages/Admin.tsx`
  - Add inquiry state, query, filters, status update, admin memo update, CSV export, detail drawer/card.
- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/App.tsx`
  - Keep current `/qksxnaud` admin route.
  - Add `/qksxnud` alias because user-facing admin URL was mentioned with this spelling.
- Review only: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/pages/OriginalSong.tsx`
  - Confirm submitted fields match admin display.
- External config: Firebase Firestore Rules
  - Public can create inquiry.
  - Authenticated admin can read/update/delete inquiries.

---

## Data Model

Existing form writes documents to:

```ts
original_song_inquiries/{docId}
```

Expected submitted fields:

```ts
type OriginalSongInquiry = {
  docId: string;
  sourceParam?: string;
  creatorName?: string;
  platforms?: string[];
  channelUrl?: string;
  purpose?: string;
  deadline?: string;
  packageName?: string;
  visualScope?: string;
  genres?: string[];
  styles?: Record<string, string>;
  selectedReference?: {
    artist?: string;
    title?: string;
    url?: string;
    style?: string;
    views?: string;
  } | null;
  customReferences?: string;
  readyMaterials?: string[];
  memo?: string;
  budget?: string;
  policyChecked?: boolean;
  email?: string;
  discord?: string;
  xAccount?: string;
  sourceAnswer?: string;
  agree?: boolean;
  createdAt?: { seconds?: number };
  status?: 'new' | 'contacted' | 'quoting' | 'won' | 'lost' | 'archived';
  adminMemo?: string;
  updatedAt?: { seconds?: number };
};
```

Status labels:

```ts
const INQUIRY_STATUS_LABELS = {
  new: '신규',
  contacted: '연락 완료',
  quoting: '견적 진행',
  won: '계약 확정',
  lost: '보류/무산',
  archived: '보관',
} as const;
```

---

## Task 1: Admin Route Alias

**Files:**
- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/App.tsx`

- [ ] **Step 1: Add typo-safe admin alias**

Add alias route next to existing admin route:

```tsx
<Route path="/qksxnaud" element={<Admin />} />
<Route path="/qksxnud" element={<Admin />} />
```

- [ ] **Step 2: Verify routes compile**

Run:

```bash
npm run lint
```

Expected:

```text
> hantōme-production@0.0.0 lint
> tsc --noEmit
```

No TypeScript errors.

---

## Task 2: Inquiry State And Fetch

**Files:**
- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/pages/Admin.tsx`

- [ ] **Step 1: Extend Firestore import**

Current import includes `serverTimestamp` nowhere. Add it:

```ts
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch, setDoc, serverTimestamp } from 'firebase/firestore';
```

- [ ] **Step 2: Add inquiry types near imports**

```ts
type InquiryStatus = 'new' | 'contacted' | 'quoting' | 'won' | 'lost' | 'archived';

type OriginalSongInquiry = {
  docId: string;
  sourceParam?: string;
  creatorName?: string;
  platforms?: string[];
  channelUrl?: string;
  purpose?: string;
  deadline?: string;
  packageName?: string;
  visualScope?: string;
  genres?: string[];
  styles?: Record<string, string>;
  selectedReference?: {
    artist?: string;
    title?: string;
    url?: string;
    style?: string;
    views?: string;
  } | null;
  customReferences?: string;
  readyMaterials?: string[];
  memo?: string;
  budget?: string;
  email?: string;
  discord?: string;
  xAccount?: string;
  sourceAnswer?: string;
  createdAt?: { seconds?: number };
  status?: InquiryStatus;
  adminMemo?: string;
};

const INQUIRY_STATUS_OPTIONS: Array<{ value: InquiryStatus; label: string }> = [
  { value: 'new', label: '신규' },
  { value: 'contacted', label: '연락 완료' },
  { value: 'quoting', label: '견적 진행' },
  { value: 'won', label: '계약 확정' },
  { value: 'lost', label: '보류/무산' },
  { value: 'archived', label: '보관' },
];
```

- [ ] **Step 3: Add states in `Admin` component**

Place near event application state:

```ts
const [inquiries, setInquiries] = useState<OriginalSongInquiry[]>([]);
const [inquiriesLoading, setInquiriesLoading] = useState(false);
const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | InquiryStatus>('all');
const [inquirySearch, setInquirySearch] = useState('');
const [selectedInquiry, setSelectedInquiry] = useState<OriginalSongInquiry | null>(null);
```

- [ ] **Step 4: Fetch inquiries after login**

Inside `if (currentUser) { ... }` add:

```ts
fetchInquiries();
```

- [ ] **Step 5: Add `fetchInquiries`**

```ts
const fetchInquiries = async () => {
  setInquiriesLoading(true);
  try {
    const q = query(collection(db, 'original_song_inquiries'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((d) => ({
      docId: d.id,
      status: 'new' as InquiryStatus,
      ...d.data(),
    })) as OriginalSongInquiry[];
    setInquiries(data);
  } catch (err) {
    console.error('Original Song Inquiries Fetch Error:', err);
  } finally {
    setInquiriesLoading(false);
  }
};
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
```

Expected: no TypeScript errors.

---

## Task 3: Inquiry Status And Memo Updates

**Files:**
- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/pages/Admin.tsx`

- [ ] **Step 1: Add status update function**

```ts
const updateInquiryStatus = async (docId: string, status: InquiryStatus) => {
  await updateDoc(doc(db, 'original_song_inquiries', docId), {
    status,
    updatedAt: serverTimestamp(),
  });
  setInquiries((prev) => prev.map((item) => (item.docId === docId ? { ...item, status } : item)));
  setSelectedInquiry((prev) => (prev?.docId === docId ? { ...prev, status } : prev));
};
```

- [ ] **Step 2: Add admin memo update function**

```ts
const updateInquiryMemo = async (docId: string, adminMemo: string) => {
  await updateDoc(doc(db, 'original_song_inquiries', docId), {
    adminMemo,
    updatedAt: serverTimestamp(),
  });
  setInquiries((prev) => prev.map((item) => (item.docId === docId ? { ...item, adminMemo } : item)));
  setSelectedInquiry((prev) => (prev?.docId === docId ? { ...prev, adminMemo } : prev));
};
```

- [ ] **Step 3: Add filtering logic before `return`**

```ts
const normalizedInquirySearch = inquirySearch.trim().toLowerCase();

const filteredInquiries = inquiries.filter((item) => {
  const status = item.status || 'new';
  const statusMatches = inquiryStatusFilter === 'all' || status === inquiryStatusFilter;
  const searchTarget = [
    item.creatorName,
    item.email,
    item.discord,
    item.xAccount,
    item.channelUrl,
    item.sourceParam,
    item.sourceAnswer,
    item.packageName,
    item.purpose,
  ].filter(Boolean).join(' ').toLowerCase();
  const searchMatches = !normalizedInquirySearch || searchTarget.includes(normalizedInquirySearch);
  return statusMatches && searchMatches;
});
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
```

Expected: no TypeScript errors.

---

## Task 4: Inquiry Management UI

**Files:**
- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/pages/Admin.tsx`

- [ ] **Step 1: Add section above event applications**

Place before current `EVENT APPLICATIONS` section:

```tsx
<div className="mb-16 p-8 bg-white/[0.02] rounded-2xl border border-[#E2B6F7]/15 backdrop-blur-sm">
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
    <h2 className="text-xl font-mono text-[#E2B6F7] flex items-center gap-2">
      <span className="w-2 h-2 bg-[#E2B6F7] rounded-full animate-pulse"></span>
      ORIGINAL SONG INQUIRIES
      <span className="text-xs text-gray-500 font-mono">({filteredInquiries.length}/{inquiries.length}건)</span>
    </h2>
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={inquirySearch}
        onChange={(e) => setInquirySearch(e.target.value)}
        placeholder="활동명 / 이메일 / 디스코드 검색"
        className="bg-black border border-white/10 px-3 py-2 rounded-lg text-xs outline-none focus:border-[#E2B6F7] min-w-[240px]"
      />
      <select
        value={inquiryStatusFilter}
        onChange={(e) => setInquiryStatusFilter(e.target.value as 'all' | InquiryStatus)}
        className="bg-black border border-white/10 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:border-[#E2B6F7] cursor-pointer"
      >
        <option value="all">전체 상태</option>
        {INQUIRY_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <button
        onClick={fetchInquiries}
        className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2"
      >
        <RefreshCcw size={14} className={inquiriesLoading ? 'animate-spin' : ''} /> 새로고침
      </button>
    </div>
  </div>

  {filteredInquiries.length === 0 ? (
    <div className="text-center text-gray-600 font-mono text-sm py-12 border border-dashed border-white/10 rounded-xl">
      {inquiriesLoading ? '불러오는 중…' : '접수 데이터가 없습니다.'}
    </div>
  ) : (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-gray-500 font-mono uppercase tracking-wider border-b border-white/10">
              <th className="py-3 pr-4 whitespace-nowrap">접수일</th>
              <th className="py-3 pr-4 whitespace-nowrap">활동명</th>
              <th className="py-3 pr-4 whitespace-nowrap">연락처</th>
              <th className="py-3 pr-4 whitespace-nowrap">패키지</th>
              <th className="py-3 pr-4 whitespace-nowrap">장르</th>
              <th className="py-3 pr-4 whitespace-nowrap">예산</th>
              <th className="py-3 pr-4 whitespace-nowrap">상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map((item) => (
              <tr
                key={item.docId}
                onClick={() => setSelectedInquiry(item)}
                className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <td className="py-3 pr-4 whitespace-nowrap text-gray-500 font-mono">{fmtDate(item.createdAt)}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-white font-medium">{item.creatorName || '-'}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-gray-400">
                  <div className="text-[#E2B6F7]">{item.email || '-'}</div>
                  <div>{item.discord || '-'}</div>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{item.packageName || '-'}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{Array.isArray(item.genres) ? item.genres.join(', ') : '-'}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{item.budget || '-'}</td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <select
                    value={item.status || 'new'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateInquiryStatus(item.docId, e.target.value as InquiryStatus)}
                    className="bg-black border border-white/10 px-2 py-1 rounded text-[11px] outline-none focus:border-[#E2B6F7]"
                  >
                    {INQUIRY_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InquiryDetailCard
        inquiry={selectedInquiry}
        fmtDate={fmtDate}
        onStatusChange={updateInquiryStatus}
        onMemoSave={updateInquiryMemo}
      />
    </div>
  )}
</div>
```

- [ ] **Step 2: Add detail card component below `AdminListCard`**

```tsx
const InquiryDetailCard = ({
  inquiry,
  fmtDate,
  onStatusChange,
  onMemoSave,
}: {
  inquiry: OriginalSongInquiry | null;
  fmtDate: (ts: any) => string;
  onStatusChange: (docId: string, status: InquiryStatus) => void;
  onMemoSave: (docId: string, adminMemo: string) => void;
}) => {
  const [memoDraft, setMemoDraft] = useState('');

  useEffect(() => {
    setMemoDraft(inquiry?.adminMemo || '');
  }, [inquiry?.docId, inquiry?.adminMemo]);

  if (!inquiry) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-gray-500">
        좌측 목록에서 접수 건을 선택하세요.
      </div>
    );
  }

  const stylesText = inquiry.styles
    ? Object.entries(inquiry.styles).map(([genre, style]) => `${genre}: ${style}`).join(' / ')
    : '-';

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-sm text-gray-300 xl:sticky xl:top-28 self-start">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs font-mono text-[#E2B6F7] mb-1">{fmtDate(inquiry.createdAt)}</div>
          <h3 className="text-xl font-bold text-white">{inquiry.creatorName || '-'}</h3>
          <div className="text-xs text-gray-500 mt-1">{inquiry.sourceParam || inquiry.sourceAnswer || '유입 미기록'}</div>
        </div>
        <select
          value={inquiry.status || 'new'}
          onChange={(e) => onStatusChange(inquiry.docId, e.target.value as InquiryStatus)}
          className="bg-black border border-white/10 px-2 py-2 rounded text-xs outline-none focus:border-[#E2B6F7]"
        >
          {INQUIRY_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 text-xs leading-relaxed">
        <DetailRow label="이메일" value={inquiry.email} />
        <DetailRow label="디스코드" value={inquiry.discord} />
        <DetailRow label="X" value={inquiry.xAccount} />
        <DetailRow label="채널" value={inquiry.channelUrl} link />
        <DetailRow label="플랫폼" value={Array.isArray(inquiry.platforms) ? inquiry.platforms.join(', ') : '-'} />
        <DetailRow label="목적/납기" value={`${inquiry.purpose || '-'} / ${inquiry.deadline || '-'}`} />
        <DetailRow label="패키지" value={`${inquiry.packageName || '-'} / ${inquiry.visualScope || '-'}`} />
        <DetailRow label="장르/스타일" value={`${Array.isArray(inquiry.genres) ? inquiry.genres.join(', ') : '-'} / ${stylesText}`} />
        <DetailRow label="레퍼런스" value={inquiry.selectedReference ? `${inquiry.selectedReference.artist} - ${inquiry.selectedReference.title}` : inquiry.customReferences || '-'} />
        <DetailRow label="준비 자료" value={Array.isArray(inquiry.readyMaterials) ? inquiry.readyMaterials.join(', ') : '-'} />
        <DetailRow label="예산" value={inquiry.budget} />
        <DetailRow label="제작 메모" value={inquiry.memo} />
      </div>

      <div className="mt-5">
        <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-mono mb-2">Admin Memo</label>
        <textarea
          value={memoDraft}
          onChange={(e) => setMemoDraft(e.target.value)}
          className="w-full min-h-28 resize-y rounded-lg border border-white/10 bg-black p-3 text-xs text-white outline-none focus:border-[#E2B6F7]"
          placeholder="연락 내용, 견적 메모, 후속 액션 기록"
        />
        <button
          onClick={() => onMemoSave(inquiry.docId, memoDraft)}
          className="mt-3 w-full rounded-lg bg-[#E2B6F7] px-4 py-3 text-xs font-bold text-black hover:brightness-110 transition"
        >
          메모 저장
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Add detail row component**

```tsx
const DetailRow = ({ label, value, link }: { label: string; value?: string; link?: boolean }) => {
  const display = value || '-';
  return (
    <div className="border-b border-white/5 pb-2">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      {link && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="break-all text-[#E2B6F7] hover:text-white">
          {value}
        </a>
      ) : (
        <div className="whitespace-pre-wrap break-words text-gray-300">{display}</div>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
```

Expected: no TypeScript errors.

---

## Task 5: CSV Export

**Files:**
- Modify: `/Users/yunhwankim/Desktop/Hantome/03_Core_Systems/hantōme-homepage/pages/Admin.tsx`

- [ ] **Step 1: Add CSV escape helper before `Admin` component**

```ts
const csvCell = (value: unknown): string => {
  const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
};
```

- [ ] **Step 2: Add export function inside `Admin`**

```ts
const exportInquiriesCsv = () => {
  const header = ['접수일', '상태', '활동명', '이메일', '디스코드', 'X', '채널', '플랫폼', '목적', '납기', '패키지', '비주얼', '장르', '예산', '유입', '관리자 메모'];
  const rows = filteredInquiries.map((item) => [
    fmtDate(item.createdAt),
    INQUIRY_STATUS_OPTIONS.find((option) => option.value === (item.status || 'new'))?.label || '신규',
    item.creatorName,
    item.email,
    item.discord,
    item.xAccount,
    item.channelUrl,
    item.platforms,
    item.purpose,
    item.deadline,
    item.packageName,
    item.visualScope,
    item.genres,
    item.budget,
    item.sourceParam || item.sourceAnswer,
    item.adminMemo,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `original-song-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
```

- [ ] **Step 3: Add export button to inquiry section actions**

```tsx
<button
  onClick={exportInquiriesCsv}
  className="bg-[#E2B6F7]/10 hover:bg-[#E2B6F7]/20 border border-[#E2B6F7]/30 text-[#E2B6F7] px-3 py-2 rounded-lg text-xs font-mono transition"
>
  CSV 내보내기
</button>
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
```

Expected: no TypeScript errors.

---

## Task 6: Firebase Rules

**Files:**
- External: Firebase Console → Firestore Database → Rules

- [ ] **Step 1: Apply rules model**

If no custom admin claims exist, minimum practical rule:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /original_song_inquiries/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

- [ ] **Step 2: Safer future rule with admin claim**

When admin custom claim exists:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    match /original_song_inquiries/{docId} {
      allow create: if
        request.resource.data.creatorName is string &&
        request.resource.data.email is string &&
        request.resource.data.discord is string;
      allow read, update, delete: if isAdmin();
    }
  }
}
```

- [ ] **Step 3: Verify**

Manual check:

1. Submit test inquiry from `/original-song?source=test`.
2. Log in admin page `/qksxnaud` or `/qksxnud`.
3. Confirm new inquiry appears.
4. Change status to `연락 완료`.
5. Refresh page.
6. Confirm changed status persists.

---

## Task 7: Browser QA

**Files:**
- No code changes

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected:

```text
Local: http://127.0.0.1:3000/
```

- [ ] **Step 2: Verify admin loads**

Open:

```text
http://127.0.0.1:3000/qksxnaud
http://127.0.0.1:3000/qksxnud
```

Expected:

- Both show admin login or admin dashboard.

- [ ] **Step 3: Verify UI**

After login:

- `ORIGINAL SONG INQUIRIES` section appears above `EVENT APPLICATIONS`.
- Search input filters by activity name, email, Discord.
- Status select changes Firestore field.
- Detail card shows full request.
- Admin memo saves and persists after refresh.
- CSV export downloads Korean-readable CSV.

---

## Self-Review

Spec coverage:

- Existing Firebase backend reused: Task 2, Task 3, Task 6.
- Admin page management at `qksxnaud` / `qksxnud`: Task 1, Task 4.
- Manager-friendly view: Task 4, Task 5.
- Status workflow: Task 3, Task 4.
- Security/rules: Task 6.

Placeholder scan:

- No TBD/TODO/later placeholders.

Type consistency:

- `InquiryStatus`, `OriginalSongInquiry`, `INQUIRY_STATUS_OPTIONS` reused consistently.

