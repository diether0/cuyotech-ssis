# CuyoTech SSIS - Working Prototype

A static HTML/CSS/JavaScript prototype of the Student Services Information
System (SSIS). No server or installation needed - it uses the browser's
`localStorage` as a mock database.

## How to run
1. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
2. Log in with one of the demo accounts below.

## Demo accounts
| Role        | Username        | Password |
|-------------|-----------------|----------|
| Student     | `maria.santos`  | `1234`   |
| Registrar   | `registrar`     | `1234`   |
| Cashier     | `cashier`       | `1234`   |
| Department  | `department`    | `1234`   |
| Admin       | `admin`         | `1234`   |

## Modules / pages
- `index.html` - Login (role-based redirect)
- `student-dashboard.html` - Profile overview, GPA, subjects, requests, clearance
- `document-request.html` - Request TOR / COR / certifications with status
- `registrar.html` - Approve enrollments, encode grades, release documents
- `cashier.html` - Process payments and issue receipt numbers
- `admin.html` - Create/remove user accounts, view audit logs

## Notes
- All data is stored locally in the browser. To reset the demo data, run
  `SSIS.reset()` in the browser console (DevTools) and reload.
- This prototype demonstrates workflows and UI only; it is not connected to a
  production database or authentication service.
