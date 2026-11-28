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
