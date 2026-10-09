/* ============================================================
   CuyoTech University - Student Services Information System
   Prototype shared logic (mock data via localStorage)
   ============================================================ */
(function (window) {
  "use strict";

  var DB_KEY = "ssis_db_v1";
  var SESSION_KEY = "ssis_session";

  var SEED = {
    departments: [
      { dept_id: 1, dept_name: "College of Computing Studies", head_name: "Dr. Elena Reyes" },
      { dept_id: 2, dept_name: "College of Business", head_name: "Dr. Marco Lim" },
      { dept_id: 3, dept_name: "Library", head_name: "Ms. Grace Tan" }
    ],
    users: [
      { user_id: 1, username: "maria.santos", password: "1234", role: "student", name: "Maria Santos" },
      { user_id: 2, username: "registrar", password: "1234", role: "registrar", name: "Ana Juarez" },
      { user_id: 3, username: "cashier", password: "1234", role: "cashier", name: "Ramon Dela Cruz" },
      { user_id: 4, username: "department", password: "1234", role: "department", name: "Elena Reyes" },
      { user_id: 5, username: "admin", password: "1234", role: "admin", name: "System Admin" }
    ],
    students: [
      { student_id: "2024-00123", user_id: 1, full_name: "Maria Santos", program: "BS Computer Science", year_level: 3, email: "maria.santos@cuyotech.edu.ph" }
    ],
    courses: [
      { course_id: 1, dept_id: 1, course_code: "CS301", title: "Data Structures and Algorithms", units: 3 },
      { course_id: 2, dept_id: 1, course_code: "CS302", title: "Database Management Systems", units: 3 },
      { course_id: 3, dept_id: 1, course_code: "CS303", title: "Web Systems and Technologies", units: 3 },
      { course_id: 4, dept_id: 1, course_code: "GE201", title: "Ethics in Computing", units: 2 },
      { course_id: 5, dept_id: 1, course_code: "PE301", title: "Physical Education 3", units: 2 }
    ],
    enrollments: [
      { enrollment_id: 1, student_id: "2024-00123", course_id: 1, term: "1st Semester", school_year: "2026-2027", grade: "1.75", status: "enrolled" },
      { enrollment_id: 2, student_id: "2024-00123", course_id: 2, term: "1st Semester", school_year: "2026-2027", grade: "1.50", status: "enrolled" },
      { enrollment_id: 3, student_id: "2024-00123", course_id: 3, term: "1st Semester", school_year: "2026-2027", grade: null, status: "pending" }
    ],
    document_requests: [
      { request_id: 1001, student_id: "2024-00123", doc_type: "Transcript of Records", purpose: "Scholarship application", copies: 1, status: "processing", date_requested: "2026-10-02" },
      { request_id: 1002, student_id: "2024-00123", doc_type: "Certificate of Enrollment", purpose: "Bank account", copies: 2, status: "released", date_requested: "2026-09-20" }
    ],
    payments: [
      { payment_id: 5001, student_id: "2024-00123", description: "Tuition Fee (1st Sem 2026-2027)", amount: 18500.0, receipt_no: "OR-2026-0451", date_paid: "2026-08-05", status: "paid" },
      { payment_id: 5002, student_id: "2024-00123", description: "Document Fee - TOR", amount: 150.0, receipt_no: "OR-2026-0512", date_paid: "2026-10-02", status: "paid" },
      { payment_id: 5003, student_id: "2024-00123", description: "Miscellaneous Fees", amount: 3200.0, receipt_no: "", date_paid: "", status: "unpaid" }
    ],
    clearances: [
      { clearance_id: 1, student_id: "2024-00123", dept: "College of Computing Studies", status: "cleared", date_signed: "2026-05-28" },
      { clearance_id: 2, student_id: "2024-00123", dept: "Library", status: "pending", date_signed: "" },
      { clearance_id: 3, student_id: "2024-00123", dept: "College of Business", status: "cleared", date_signed: "2026-05-29" }
    ],
    audit_logs: [
      { id: 1, actor: "admin", action: "Created user account: cashier", date: "2026-08-01 09:12" },
      { id: 2, actor: "registrar", action: "Encoded grades for CS301", date: "2026-09-30 14:40" }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function migrateDemoUsernames(data) {
    var renames = {
      "reg.juarez": "registrar",
      "cash.delacruz": "cashier",
      "dept.reyes": "department",
      "admin.root": "admin"
    };
    var changed = false;
    Object.keys(renames).forEach(function (oldName) {
      var user = data.users.filter(function (item) { return item.username === oldName; })[0];
      var newName = renames[oldName];
      if (user && !data.users.some(function (item) { return item.username === newName; })) {
        user.username = newName;
        changed = true;
        data.audit_logs.forEach(function (log) {
          if (log.actor === oldName) log.actor = newName;
          log.action = log.action.replace(oldName, newName);
        });
        var currentSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        if (currentSession && currentSession.user_id === user.user_id) {
          currentSession.username = newName;
          localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
        }
      }
    });
    return changed;
  }

  function db() {
    var raw = localStorage.getItem(DB_KEY);
    if (!raw) { localStorage.setItem(DB_KEY, JSON.stringify(SEED)); return clone(SEED); }
    try {
      var data = JSON.parse(raw);
      if (migrateDemoUsernames(data)) save(data);
      return data;
    } catch (e) { localStorage.setItem(DB_KEY, JSON.stringify(SEED)); return clone(SEED); }
  }
  function save(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }
  function reset() { localStorage.setItem(DB_KEY, JSON.stringify(SEED)); localStorage.removeItem(SESSION_KEY); }

  function login(username, password) {
    var d = db();
    var user = d.users.filter(function (u) { return u.username === username && u.password === password; })[0];
    if (!user) return null;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user_id: user.user_id, username: user.username, role: user.role, name: user.name }));
    addLog(user.username, "User logged in");
    return user;
  }
  function registerStudent(details) {
    var d = db();
    var username = details.username.trim().toLowerCase();
    var studentId = details.studentId.trim();
    var email = details.email.trim().toLowerCase();
    if (d.users.some(function (user) { return user.username.toLowerCase() === username; })) {
      return { error: "That username is already in use." };
    }
    if (d.students.some(function (student) {
      return student.student_id.toLowerCase() === studentId.toLowerCase() || student.email.toLowerCase() === email;
    })) {
      return { error: "That student number or email is already registered." };
    }

    var userId = d.users.reduce(function (max, user) { return Math.max(max, user.user_id); }, 0) + 1;
    var user = {
      user_id: userId, username: username, password: details.password,
      role: "student", name: details.fullName.trim()
    };
    d.users.push(user);
    d.students.push({
      student_id: studentId, user_id: userId, full_name: user.name,
      program: details.program.trim(), year_level: Number(details.yearLevel), email: email
    });
    save(d);
    addLog(username, "Created student account");
    return user;
  }
  function session() {
    var raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  function logout() { localStorage.removeItem(SESSION_KEY); window.location.href = "index.html"; }

  function requireRole(roles) {
    var s = session();
    if (!s) { window.location.href = "index.html"; return null; }
    if (roles && roles.indexOf(s.role) === -1) { window.location.href = homeFor(s.role); return null; }
    return s;
  }
  function homeFor(role) {
    switch (role) {
      case "student": return "student-dashboard.html";
      case "registrar": return "registrar.html";
      case "cashier": return "cashier.html";
      case "department": return "registrar.html";
      case "admin": return "admin.html";
      default: return "index.html";
    }
  }

  function addLog(actor, action) {
    var d = db();
    d.audit_logs.unshift({ id: Date.now(), actor: actor, action: action, date: new Date().toLocaleString() });
    save(d);
  }
  function log(actor, action) { addLog(actor, action); }

  function money(n) {
    return "PHP " + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function badge(status) {
    var s = String(status || "").toLowerCase().replace(/\s+/g, "-");
    var known = ["paid", "approved", "cleared", "released", "enrolled", "pending", "processing", "unpaid", "rejected", "flagged"];
    var cls = known.indexOf(s) !== -1 ? s : "info";
    return '<span class="badge ' + cls + '">' + status + "</span>";
  }
  function byId(arr, key, val) { return arr.filter(function (x) { return String(x[key]) === String(val); })[0]; }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    return String(name || "?").split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
  }

  window.SSIS = {
    db: db, save: save, reset: reset, login: login, registerStudent: registerStudent, session: session, logout: logout,
    requireRole: requireRole, homeFor: homeFor, log: log, money: money, badge: badge,
    byId: byId, esc: esc, initials: initials, SEED: SEED
  };
})(window);
