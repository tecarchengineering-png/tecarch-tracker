# TecArch Project Tracker

Web app for the TecArch team to track site (drawing/file) and supervision projects: stages, payments, deadlines, files & photos, and update history.

- Frontend: single `index.html` (hosted on GitHub Pages)
- Backend: Supabase project `tecarch-tracker` (database, login, file storage)
- Access: only people added on the Team page can see data.

## Finance (`/finance/`)

Admin and Accountant only. It covers clients and partner firms, jobs with agreed fees and payment schedules, receipts (who paid, how, and into which account), payment requests and invoices (print/PDF, WhatsApp, Viber, Gmail), outsourced work orders and payouts with TDS, expenses, transfers between accounts, reports (monthly, profit by job, outstanding by payer, VAT, TDS) and a "To check" list.

- Database tables are `fin_*`. Summary views are `fin_job_summary`, `fin_milestone_status`, `fin_work_order_summary`, `fin_account_balances`, `fin_party_balances`, `fin_alerts` and `fin_monthly`.
- Every change and delete is logged in `fin_audit`. Only the admin can delete.
- Add an accountant on the Team page with the role "Accountant".

## Nepali calendar & fiscal year (`lib/bs.js`)

- Bikram Sambat dates are converted with a month table for 2070–2089 BS, cross-checked against two libraries.
- The fiscal year runs from 1 Shrawan to the end of Ashadh. In the database, `fy_start(date)` and `fy_short(date)` read from `bs_fiscal_years`.
- In Finance, closing a year (`fin_fy_closings`) locks every entry dated in that year. The admin can reopen it.

## Valuation (`/valuation/`)

Property valuation certificates, open to the admin, accountant, engineers and architects.

- Reference numbers restart each fiscal year (`TEC 001/83/84`) and are assigned by the database.
- Areas, values and the foreign-currency total are calculated by the trigger `private.valuation_calc`.
- Every change is kept in `fin_audit`.
