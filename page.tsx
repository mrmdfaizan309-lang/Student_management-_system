"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Students", icon: Users },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Examinations", icon: BookOpen },
  { label: "Fees & billing", icon: WalletCards },
];

const activities = [
  { initials: "AM", name: "Ava Mitchell", action: "submitted a fee payment", time: "12 min ago", tone: "coral" },
  { initials: "JL", name: "Jonas Lee", action: "was marked present in 10-B", time: "38 min ago", tone: "mint" },
  { initials: "SW", name: "Sofia Williams", action: "uploaded an examination result", time: "1 hr ago", tone: "violet" },
];

const schedule = [
  { time: "09:00", title: "Mathematics", group: "Grade 10 - B", color: "blue" },
  { time: "11:30", title: "Parent advisory", group: "Room 204", color: "yellow" },
  { time: "14:00", title: "Science practical", group: "Grade 11 - A", color: "coral" },
];

type UserRole = "ADMINISTRATOR" | "TEACHER" | "STUDENT";
type CurrentUser = { id: string; name: string; email: string | null; phone: string | null; role: UserRole };

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentTotal, setStudentTotal] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session").then(async (response) => {
      const data = await response.json();
      if (response.ok) setCurrentUser(data.user);
    }).catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    setToday(new Date());
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load dashboard");
        setStudentTotal(data.students?.total ?? 0);
      })
      .catch(() => setStudentTotal(0));
  }, []);

  useEffect(() => {
    if (activeNav !== "Students") return;
    setLoadingStudents(true);
    setStudentsError("");
    fetch("/api/students")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load students");
        setStudents(data.students ?? []);
      })
      .catch((error: Error) => {
        setStudents([]);
        setStudentsError(error.message);
      })
      .finally(() => setLoadingStudents(false));
  }, [activeNav]);

  function handleAddRecord() {
    setActiveNav("Students");
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  const visibleNavItems = currentUser ? navItems.filter(({ label }) => {
    if (currentUser?.role === "STUDENT") return label === "Overview" || label === "Examinations";
    if (currentUser?.role === "TEACHER") return label !== "Fees & billing";
    return true;
  }) : [];
  const roleLabel = currentUser?.role === "ADMINISTRATOR" ? "Administrator" : currentUser?.role === "TEACHER" ? "Teacher" : "Student";
  const initials = currentUser?.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><GraduationCap size={19} strokeWidth={2.5} /></div><span>Edu<span>Manage</span></span></div>
        <div className="school-switcher"><div className="school-avatar">IA</div><div><strong>IQRA Academy</strong><small>2024 / 25 academic year</small></div><ChevronDown size={15} /></div>
        <div className="nav-section"><p>Workspace</p>{visibleNavItems.map(({ label, icon: Icon }) => <button className={`nav-item ${activeNav === label ? "active" : ""}`} key={label} onClick={() => setActiveNav(label)}><Icon size={18} /><span>{label}</span>{label === "Students" && <em>{studentTotal}</em>}</button>)}</div>
        <div className="nav-section lower"><p>Manage</p><button className={`nav-item ${activeNav === "Calendar" ? "active" : ""}`} onClick={() => setActiveNav("Calendar")}><CalendarDays size={18} /><span>Calendar</span></button>{currentUser?.role === "ADMINISTRATOR" && <button className={`nav-item ${activeNav === "Settings" ? "active" : ""}`} onClick={() => setActiveNav("Settings")}><Settings size={18} /><span>Settings</span></button>}</div>
        <div className="sidebar-footer"><div className="help-icon"><Sparkles size={17} /></div><div><strong>Need a hand?</strong><small>Visit the help center</small></div><ChevronDown size={14} /></div>
      </aside>

      <section className="content-area">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><div className="search"><Search size={17} /><input aria-label="Search" placeholder="Search anything" /></div><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><div className="profile"><div className="profile-avatar">{initials}</div><div><strong>{currentUser?.name ?? "Account"}</strong><small>{roleLabel}</small></div><button className="icon-button auth-logout" type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div></div></header>
        <div className="page-content">
          {activeNav !== "Overview" ? <WorkspaceView activeNav={activeNav} role={currentUser?.role ?? "STUDENT"} students={students} loadingStudents={loadingStudents} studentsError={studentsError} onStudentAdded={(student) => { setStudents((current) => [student, ...current]); setStudentTotal((current) => current + 1); }} onStudentUpdated={(student) => setStudents((current) => current.map((item) => item.id === student.id ? student : item))} onStudentDeleted={(studentId) => { setStudents((current) => current.filter((item) => item.id !== studentId)); setStudentTotal((current) => Math.max(0, current - 1)); }} onStudentsError={setStudentsError} /> : <>
          <div className="welcome-row"><div><p className="eyebrow">{today?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) ?? ""}</p><h1>Good morning, {currentUser?.name.split(" ")[0] ?? ""} <span>✦</span></h1><p className="subheading">Here is what is happening across IQRA Academy today.</p></div><div className="header-actions">{currentUser && currentUser.role !== "STUDENT" && <button className="primary-button" onClick={handleAddRecord}><Plus size={17} /> Add record</button>}</div></div>

          <div className="stat-grid"><StatCard label="Total students" value={String(studentTotal)} change="Live database count" icon={<Users size={20} />} tone="blue" /><StatCard label="Attendance today" value="94.8%" change="2.4% vs last week" icon={<ClipboardCheck size={20} />} tone="mint" />{currentUser?.role === "ADMINISTRATOR" && <StatCard label="Fees collected" value="₹84,620" change="82% of target" icon={<CircleDollarSign size={20} />} tone="yellow" />}<StatCard label="Upcoming exams" value="06" change="Next: Oct 04" icon={<BookOpen size={20} />} tone="coral" /></div>

          <div className="dashboard-grid"><section className="panel attendance-panel"><div className="panel-heading"><div><p className="eyebrow">Daily overview</p><h2>Attendance snapshot</h2></div><button className="more-button" aria-label="More attendance options"><MoreHorizontal size={20} /></button></div><div className="attendance-body"><div className="donut-wrap"><div className="donut"><div><strong>94.8%</strong><span>Present</span></div></div><div className="donut-caption"><span className="legend-dot mint-dot" /> Present <strong>235</strong></div><div className="donut-caption"><span className="legend-dot coral-dot" /> Absent <strong>13</strong></div></div><div className="bar-chart"><div className="chart-label"><span>Weekly attendance</span><strong>+3.1%</strong></div><div className="bars">{[62, 78, 72, 88, 84, 94, 80].map((height, index) => <div className="bar-column" key={index}><div className="bar-track"><div className={`bar-fill ${index === 5 ? "highlight" : ""}`} style={{ height: `${height}%` }} /></div><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}</div></div></div></section>

            <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Live feed</p><h2>Recent activity</h2></div><button className="text-button">View all</button></div><div className="activity-list">{activities.map((item) => <div className="activity-item" key={item.name}><div className={`activity-avatar ${item.tone}`}>{item.initials}</div><div className="activity-copy"><p><strong>{item.name}</strong> {item.action}</p><span>{item.time}</span></div><MoreHorizontal size={18} className="activity-more" /></div>)}</div><button className="outline-button">Open activity log</button></section></div>

          <div className="bottom-grid"><section className="panel schedule-panel"><div className="panel-heading"><div><p className="eyebrow">{today?.toLocaleDateString("en-US", { month: "long", day: "numeric" }) ?? ""}</p><h2>Today&apos;s schedule</h2></div><button className="text-button">Full calendar</button></div><div className="schedule-list">{schedule.map((item) => <div className="schedule-item" key={item.time}><time>{item.time}</time><div className={`schedule-marker ${item.color}`} /><div className="schedule-copy"><strong>{item.title}</strong><span>{item.group}</span></div><ChevronDown size={16} className="schedule-arrow" /></div>)}</div></section><section className="panel insight-panel"><div className="insight-art"><div className="insight-sun" /><div className="insight-wave" /></div><div className="insight-copy"><span className="insight-label"><Sparkles size={14} /> Weekly insight</span><h2>Attendance is trending up.</h2><p>Your average attendance improved by 3.1% this week. Keep the momentum going.</p><button className="text-button">See attendance report <span>→</span></button></div></section></div>
          </>}
        </div>
      </section>
    </main>
  );
}

type Student = { id: string; studentCode: string; firstName: string; lastName: string; grade: string; section: string; guardian?: string };
type CalendarEvent = { id: string; title: string; eventDate: string; startTime: string; location?: string | null };

function WorkspaceView({ activeNav, role, students, loadingStudents, studentsError, onStudentAdded, onStudentUpdated, onStudentDeleted, onStudentsError }: { activeNav: string; role: UserRole; students: Student[]; loadingStudents: boolean; studentsError: string; onStudentAdded: (student: Student) => void; onStudentUpdated: (student: Student) => void; onStudentDeleted: (studentId: string) => void; onStudentsError: (message: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");

  if (activeNav === "Students") {
    const filteredStudents = students.filter((student) => {
      const query = studentQuery.trim().toLowerCase();
      if (!query) return true;
      return student.studentCode.toLowerCase().includes(query);
    });

    async function deleteStudent(student: Student) {
      if (!window.confirm(`Delete ${student.firstName} ${student.lastName}?`)) return;
      const response = await fetch("/api/students", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: student.id }) });
      const data = await response.json();
      if (!response.ok) { onStudentsError(data.error ?? "Unable to delete student"); return; }
      onStudentDeleted(student.id);
    }

    return <section className="workspace-view"><div className="workspace-heading"><div><p className="eyebrow">Directory</p><h1>Students</h1><p className="subheading">Manage enrolment, classes, and guardian details.</p></div><button className="primary-button" onClick={() => { setEditingStudent(null); setShowForm((value) => !value); }}><Plus size={17} /> Add student</button></div>{(showForm || editingStudent) && <StudentForm student={editingStudent} saving={saving} onCancel={() => { setShowForm(false); setEditingStudent(null); }} onSaving={setSaving} onAdded={(student) => { onStudentAdded(student); setShowForm(false); }} onUpdated={(student) => { onStudentUpdated(student); setEditingStudent(null); }} />}<div className="panel table-panel"><div className="search search-student"><Search size={17} /><input aria-label="Search student by student ID" placeholder="Search by Student ID" value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} /></div>{loadingStudents ? <p className="empty-state">Loading students...</p> : studentsError ? <p className="empty-state error-state">{studentsError}. Add `DATABASE_URL` in `.env`, then run `npm run db:push`.</p> : filteredStudents.length === 0 ? <p className="empty-state">{students.length === 0 ? "No students found. Add the first student above." : "No students match this Student ID."}</p> : <div className="student-table"><div className="table-row table-header"><span>Student</span><span>Student ID</span><span>Class</span><span>Guardian</span><span>Actions</span></div>{filteredStudents.map((student) => <div className="table-row student-data-row" key={student.id}><span className="student-name"><b>{student.firstName[0]}{student.lastName[0]}</b><strong>{student.firstName} {student.lastName}</strong></span><span>{student.studentCode}</span><span>{student.grade} - {student.section}</span><span>{student.guardian ?? "Not added"}</span><span className="student-actions"><button className="icon-button" type="button" onClick={() => { setShowForm(false); setEditingStudent(student); }} aria-label={`Edit ${student.firstName} ${student.lastName}`}><Pencil size={15} /></button><button className="icon-button delete-button" type="button" onClick={() => deleteStudent(student)} aria-label={`Delete ${student.firstName} ${student.lastName}`}><Trash2 size={15} /></button></span></div>)}</div>}</div></section>;
  }

  const copy: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    Attendance: { title: "Attendance", description: "Review daily attendance and follow up on absences.", icon: <ClipboardCheck size={24} /> },
    Examinations: { title: "Examinations", description: "Plan exams, record results, and track academic progress.", icon: <BookOpen size={24} /> },
    "Fees & billing": { title: "Fees & billing", description: "Track collections, pending invoices, and payment activity.", icon: <WalletCards size={24} /> },
    Calendar: { title: "Calendar", description: "Keep classes, meetings, and examination dates in one place.", icon: <CalendarDays size={24} /> },
    Settings: { title: "Settings", description: "Configure your school workspace and administrator preferences.", icon: <Settings size={24} /> },
  };
  const section = copy[activeNav] ?? copy.Calendar;
  return <BackendWorkspace activeNav={activeNav} role={role} section={section} />;
}

function BackendWorkspace({ activeNav, role, section }: { activeNav: string; role: UserRole; section: { title: string; description: string; icon: React.ReactNode } }) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({ schoolName: "IQRA Academy", academicYear: "2024 / 25", timezone: "Asia/Kolkata" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const endpoint = activeNav === "Attendance" ? "attendance" : activeNav === "Examinations" ? "exams" : activeNav === "Fees & billing" ? "payments" : activeNav.toLowerCase();

  useEffect(() => {
    setError("");
    if (activeNav === "Settings") {
      fetch("/api/settings").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setSettings((current) => ({ ...current, ...data.settings })); }).catch((reason: Error) => setError(reason.message));
      return;
    }
    fetch(`/api/${endpoint}`).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setRecords(data.records ?? data.exams ?? data.payments ?? data.events ?? []); }).catch((reason: Error) => { setRecords([]); setError(reason.message); });
  }, [activeNav, endpoint]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(activeNav === "Settings" ? "/api/settings" : `/api/${endpoint}`, { method: activeNav === "Settings" ? "PATCH" : editingRecord ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, ...(editingRecord ? { id: editingRecord.id } : {}) }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Unable to save record");
    else if (activeNav === "Settings") setSettings((current) => ({ ...current, ...data.settings }));
    else if (editingRecord) setRecords((current) => current.map((record) => record.id === editingRecord.id ? (data.record ?? data.exam ?? data.payment ?? data.event) : record));
    else setRecords((current) => [...current, data.record ?? data.exam ?? data.payment ?? data.event]);
    if (response.ok) setEditingRecord(null);
    setSaving(false);
    if (response.ok) event.currentTarget.reset();
  }

  const attendanceDate = editingRecord?.date ? new Date(String(editingRecord.date)).toISOString().slice(0, 10) : "";
  const fieldSet = activeNav === "Attendance" ? <><input name="studentId" required placeholder="Student ID (database id)" defaultValue={String(editingRecord?.studentId ?? "")} /><input name="date" type="date" required defaultValue={attendanceDate} /><select name="status" defaultValue={String(editingRecord?.status ?? "PRESENT")}><option>PRESENT</option><option>ABSENT</option><option>LATE</option><option>EXCUSED</option></select></> : activeNav === "Examinations" ? <><input name="name" required placeholder="Exam name" /><input name="subject" required placeholder="Subject" /><input name="examDate" type="date" required /></> : activeNav === "Fees & billing" ? <><input name="studentId" required placeholder="Student ID (database id)" /><input name="amount" type="number" min="0" step="0.01" required placeholder="Amount" /><input name="dueDate" type="date" required /><select name="status" defaultValue="PENDING"><option>PENDING</option><option>PAID</option><option>OVERDUE</option></select></> : activeNav === "Calendar" ? <><input name="title" required placeholder="Event title" /><input name="eventDate" type="date" required /><input name="startTime" type="time" required /><input name="location" placeholder="Location" /></> : <><input name="schoolName" value={settings.schoolName ?? ""} onChange={(event) => setSettings({ ...settings, schoolName: event.target.value })} placeholder="School name" /><input name="academicYear" value={settings.academicYear ?? ""} onChange={(event) => setSettings({ ...settings, academicYear: event.target.value })} placeholder="Academic year" /><input name="timezone" value={settings.timezone ?? ""} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })} placeholder="Timezone" /></>;

  async function deleteRecord(record: Record<string, unknown>) {
    if (!window.confirm("Delete this attendance record?")) return;
    const response = await fetch(`/api/${endpoint}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Unable to delete record");
    else setRecords((current) => current.filter((item) => item.id !== record.id));
  }

  const formatDateValue = (value: unknown) => {
    if (!value) return "No date";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  const getRecordLabel = (record: Record<string, unknown>) => {
    if (activeNav === "Calendar") {
      const title = String(record.title ?? "Calendar event");
      const date = formatDateValue(record.eventDate);
      const time = record.startTime ? String(record.startTime) : "";
      return `${title} • ${date}${time ? ` • ${time}` : ""}`;
    }
    if (activeNav === "Examinations") return String(record.name ?? record.subject ?? "Exam");
    if (activeNav === "Fees & billing") return String(record.status ?? "Payment");
    if (activeNav === "Attendance") return String(record.status ?? "Attendance");
    return String(record.title ?? record.name ?? record.status ?? "Record");
  };

  const getRecordMeta = (record: Record<string, unknown>) => {
    if (activeNav === "Calendar") {
      const date = formatDateValue(record.eventDate);
      const time = record.startTime ? String(record.startTime) : "No time";
      const location = record.location ? String(record.location) : "No location";
      return `${date} • ${time} • ${location}`;
    }
    if (activeNav === "Examinations") return record.examDate ? formatDateValue(record.examDate) : String(record.subject ?? "No date");
    if (activeNav === "Fees & billing") return record.dueDate ? formatDateValue(record.dueDate) : String(record.amount ?? "No due date");
    if (activeNav === "Attendance") return record.date ? formatDateValue(record.date) : "No date";
    return String(record.subject ?? record.startTime ?? record.amount ?? record.date ?? "Saved");
  };

  if (activeNav === "Calendar") {
    return <section className="workspace-view"><div className="workspace-heading"><div><p className="eyebrow">Workspace</p><h1>{section.title}</h1><p className="subheading">{section.description}</p></div></div>{error && <p className="empty-state error-state">{error}. Check your PostgreSQL `DATABASE_URL` and run `npm run db:push`.</p>}<CalendarView events={records as CalendarEvent[]} />{role !== "STUDENT" && <form className="student-form backend-form" onSubmit={submit}>{fieldSet}<div className="form-actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Add event"}</button></div></form>}<div className="panel table-panel backend-records"><div className="panel-heading"><div><p className="eyebrow">Database records</p><h2>Recent calendar events</h2></div></div>{records.length === 0 ? <p className="empty-state">No records found yet.</p> : records.slice(0, 20).map((record, index) => <div className="backend-record" key={String(record.id ?? index)}><strong>{getRecordLabel(record)}</strong><span>{getRecordMeta(record)}</span></div>)}</div></section>;
  }

  const readOnly = role === "STUDENT" && activeNav === "Examinations";
  return <section className="workspace-view"><div className="workspace-heading"><div><p className="eyebrow">Workspace</p><h1>{section.title}</h1><p className="subheading">{section.description}</p></div></div>{error && <p className="empty-state error-state">{error}. Check your PostgreSQL `DATABASE_URL` and run `npm run db:push`.</p>}{!readOnly && <form className="student-form backend-form" onSubmit={submit}>{fieldSet}<div className="form-actions">{activeNav === "Attendance" && editingRecord && <button type="button" className="outline-button" onClick={() => setEditingRecord(null)}>Cancel edit</button>}<button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : activeNav === "Settings" ? "Save settings" : editingRecord ? "Update attendance" : `Add ${activeNav === "Fees & billing" ? "payment" : activeNav === "Calendar" ? "event" : activeNav === "Examinations" ? "exam" : "attendance"}`}</button></div></form>}<div className="panel table-panel backend-records"><div className="panel-heading"><div><p className="eyebrow">Database records</p><h2>Recent {section.title.toLowerCase()}</h2></div></div>{records.length === 0 ? <p className="empty-state">No records found yet.</p> : records.slice(0, 20).map((record, index) => { const student = record.student as { firstName?: string } | undefined; return <div className="backend-record" key={String(record.id ?? index)}><strong>{getRecordLabel(record) || String(student?.firstName ?? "Record")}</strong><span>{getRecordMeta(record)}</span>{activeNav === "Attendance" && <span className="student-actions"><button className="icon-button" type="button" onClick={() => setEditingRecord(record)} aria-label="Edit attendance"><Pencil size={15} /></button><button className="icon-button delete-button" type="button" onClick={() => deleteRecord(record)} aria-label="Delete attendance"><Trash2 size={15} /></button></span>}</div>; })}</div></section>;
}

function CalendarView({ events }: { events: CalendarEvent[] }) {
  const holidayKeywords = ["holiday", "republic", "independence", "gandhi", "christmas", "diwali", "deepavali", "holi", "eid", "ram navami", "janmashtami", "dussehra", "onam", "guru nanak"];
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);
  const eventsForDay = (day: number) => events.filter((event) => {
    const date = new Date(event.eventDate);
    return date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day;
  });
  const isHoliday = (day: number) => {
    const date = new Date(year, monthIndex, day);
    const recurringHoliday = (monthIndex === 0 && date.getDate() === 26) || (monthIndex === 7 && date.getDate() === 15) || (monthIndex === 9 && date.getDate() === 2) || (monthIndex === 11 && date.getDate() === 25);
    const holidayEvent = eventsForDay(day).some((event) => holidayKeywords.some((keyword) => event.title.toLowerCase().includes(keyword)));
    return recurringHoliday || holidayEvent;
  };

  return <section className="panel calendar-panel"><div className="calendar-toolbar"><div><p className="eyebrow">Schedule</p><h2>{monthName}</h2></div><div className="calendar-actions"><button className="outline-button" type="button" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">Previous</button><button className="outline-button" type="button" onClick={() => setMonth(new Date())}>Today</button><button className="outline-button" type="button" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month">Next</button></div></div><div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span className={day === "Sun" ? "sunday-label" : ""} key={day}>{day}</span>)}</div><div className="calendar-grid">{cells.map((day, index) => <div className={`calendar-day ${day === null ? "calendar-day-empty" : ""} ${index % 7 === 0 ? "sunday-cell" : ""} ${day && isHoliday(day) ? "holiday-cell" : ""}`} key={`${day ?? "empty"}-${index}`}>{day && <><strong>{day}</strong>{eventsForDay(day).map((event) => <div className={`calendar-event ${holidayKeywords.some((keyword) => event.title.toLowerCase().includes(keyword)) ? "holiday-event" : ""}`} key={event.id} title={`${event.title} ${event.startTime}`}><b>{event.startTime}</b> {event.title}</div>)}</>}</div>)}</div></section>;
}

function StudentForm({ student, saving, onCancel, onSaving, onAdded, onUpdated }: { student?: Student | null; saving: boolean; onCancel: () => void; onSaving: (saving: boolean) => void; onAdded: (student: Student) => void; onUpdated: (student: Student) => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/students", { method: student ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(form), ...(student ? { id: student.id } : {}) }) });
    const data = await response.json();
    if (response.ok) student ? onUpdated(data.student) : onAdded(data.student);
    onSaving(false);
  }
  return <form className="student-form" onSubmit={submit}><input name="firstName" required placeholder="First name" defaultValue={student?.firstName ?? ""} /><input name="lastName" required placeholder="Last name" defaultValue={student?.lastName ?? ""} /><input name="studentCode" required placeholder="Student ID" defaultValue={student?.studentCode ?? ""} /><input name="grade" required placeholder="Grade" defaultValue={student?.grade ?? ""} /><input name="section" required placeholder="Section" defaultValue={student?.section ?? ""} /><input name="guardian" placeholder="Guardian name" defaultValue={student?.guardian ?? ""} /><div className="form-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : student ? "Update student" : "Save student"}</button></div></form>;
}

function StatCard({ label, value, change, icon, tone }: { label: string; value: string; change: string; icon: React.ReactNode; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><p>{label}</p><strong>{value}</strong><span className={tone === "coral" ? "neutral-change" : "positive-change"}>{tone !== "coral" && "↗ "}{change}</span></div>;
}
